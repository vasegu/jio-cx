"""Signal processor - subscribes to event topics, filters, enriches, interprets.

This is the OBSERVE layer of the OODA loop. Raw events come in from Pub/Sub,
get filtered (is this worth acting on?), enriched (who is this customer?),
interpreted (what does this mean?), and output as enriched events to the
agent trigger topic.

In production this would be Dataflow/Flink. For prototype it's a simple
Python subscriber.

Usage:
    python processor.py                # process all topics
    python processor.py --topic billing  # process one topic only
    python processor.py --once         # pull once and exit (no streaming)
"""

import argparse
import json
import uuid
from datetime import datetime
from pathlib import Path

from google.cloud import pubsub_v1

PROJECT_ID = "jiobuddy-492811"
TRIGGER_TOPIC = "jio-agent-triggers"

# Load customer profiles for enrichment
PROFILES_PATH = Path(__file__).parent.parent / "agent/data/corpus/synthetic/customer-profiles.json"

_profiles = None


def get_profiles():
    global _profiles
    if _profiles is None:
        with open(PROFILES_PATH) as f:
            _profiles = {p["customer_id"]: p for p in json.load(f)}
    return _profiles


# --- FILTER ---
# Drop noise. Only forward events worth acting on.

FILTER_RULES = {
    "data_usage": lambda e: e.get("data_used_pct", 0) >= 80,
    "qoe_drop": lambda e: e.get("download_speed_mbps", 999) < e.get("plan_speed_mbps", 0) * 0.4 or e.get("latency_ms", 0) > 100,
    "cpe_offline": lambda e: True,  # always actionable
    "payment_due": lambda e: e.get("days_until_due", 99) <= 3,
    "page_view": lambda e: e.get("page", "") in ("complaint_form", "cancel_service", "port_out_info"),
    "heartbeat": lambda e: e.get("connected_devices", 0) > 10 or e.get("temperature_celsius", 0) > 55,
    "recharge": lambda e: True,
    "signal_change": lambda e: e.get("wifi_signal") == "weak",
}


def should_pass_filter(event: dict) -> bool:
    """Returns True if this event is worth acting on."""
    event_type = event.get("event_type", "")
    rule = FILTER_RULES.get(event_type)
    if rule is None:
        return False  # unknown event type, drop
    return rule(event)


# --- ENRICH ---
# Attach customer profile to the event.

def enrich(event: dict) -> dict:
    """Add customer context to the event."""
    profiles = get_profiles()
    customer_id = event.get("customer_id", "")
    profile = profiles.get(customer_id)

    if not profile:
        return {**event, "enriched": False, "enrichment_error": f"unknown customer {customer_id}"}

    return {
        **event,
        "enriched": True,
        "customer_name": profile["name"],
        "customer_language": profile["primary_language"],
        "customer_plan": profile["plan"]["name"],
        "customer_plan_speed": profile["plan"]["speed_mbps"],
        "customer_plan_price": profile["plan"]["price_inr"],
        "customer_tenure_days": profile["tenure_days"],
        "customer_nps": profile["nps_score"],
        "customer_risk": profile["risk_level"],
        "customer_channel": profile["channel_preference"],
        "customer_complaints": profile["complaints_count"],
        "customer_household_size": profile["household_size"],
    }


# --- INTERPRET ---
# Convert raw event + context into a semantic business signal.

def interpret(enriched_event: dict) -> dict:
    """Classify the enriched event into a business signal with urgency."""
    event_type = enriched_event.get("event_type", "")
    risk = enriched_event.get("customer_risk", "low")
    nps = enriched_event.get("customer_nps", 10)
    tenure = enriched_event.get("customer_tenure_days", 999)

    # Base signal classification
    signal_map = {
        "data_usage": "approaching_data_cap",
        "qoe_drop": "network_degraded",
        "cpe_offline": "connection_lost",
        "payment_due": "recharge_expiring",
        "page_view": "churn_intent_detected",
        "heartbeat": "device_stress",
    }
    signal_type = signal_map.get(event_type, f"unknown_{event_type}")

    # Urgency calculation
    # Base urgency from event type
    urgency_base = {
        "approaching_data_cap": "medium",
        "network_degraded": "medium",
        "connection_lost": "high",
        "recharge_expiring": "medium",
        "churn_intent_detected": "high",
        "device_stress": "low",
    }.get(signal_type, "low")

    # Escalate urgency based on customer context
    if risk == "high" or nps <= 3:
        urgency = "critical" if urgency_base in ("high", "medium") else "high"
    elif risk == "medium" and urgency_base == "medium":
        urgency = "high"
    else:
        urgency = urgency_base

    # Early-life customers get urgency bump (they're in the 0-90 day proving window)
    if tenure <= 30 and urgency in ("low", "medium"):
        urgency = "medium" if urgency == "low" else "high"

    # Human-readable summary
    summaries = {
        "approaching_data_cap": f"{enriched_event.get('customer_name', '?')} is at {enriched_event.get('data_used_pct', 0):.0f}% data usage on day {tenure}",
        "network_degraded": f"{enriched_event.get('customer_name', '?')} getting {enriched_event.get('download_speed_mbps', 0)}Mbps on a {enriched_event.get('customer_plan_speed', 0)}Mbps plan",
        "connection_lost": f"{enriched_event.get('customer_name', '?')}'s router went offline",
        "recharge_expiring": f"{enriched_event.get('customer_name', '?')}'s plan expires in {enriched_event.get('days_until_due', '?')} days",
        "churn_intent_detected": f"{enriched_event.get('customer_name', '?')} (NPS {nps}) viewed {enriched_event.get('page', '?')} page",
        "device_stress": f"{enriched_event.get('customer_name', '?')} has {enriched_event.get('connected_devices', 0)} devices, router at {enriched_event.get('temperature_celsius', 0)}C",
    }

    return {
        "event_id": str(uuid.uuid4()),
        "timestamp": enriched_event.get("timestamp", datetime.now().isoformat()),
        "source_topic": enriched_event.get("_source_topic", "unknown"),
        "signal_type": signal_type,
        "urgency": urgency,
        "raw_event_summary": summaries.get(signal_type, f"Unknown signal: {signal_type}"),
        "customer_id": enriched_event.get("customer_id"),
        "customer_name": enriched_event.get("customer_name", "Unknown"),
        "customer_language": enriched_event.get("customer_language", "en"),
        "customer_plan": enriched_event.get("customer_plan", "Unknown"),
        "customer_tenure_days": enriched_event.get("customer_tenure_days", 0),
        "customer_nps": enriched_event.get("customer_nps", 0),
        "customer_risk": enriched_event.get("customer_risk", "unknown"),
        "customer_channel": enriched_event.get("customer_channel", "app"),
        "customer_complaints": enriched_event.get("customer_complaints", 0),
        "customer_household_size": enriched_event.get("customer_household_size", 1),
        "in_pilot_segment": tenure <= 90,  # early-life only
        "contact_allowed": True,  # TODO: check contact history
        "exposure_mode": "shadow",  # start in shadow mode
    }


# --- PIPELINE ---

publisher = pubsub_v1.PublisherClient()


def publish_trigger(enriched_event: dict):
    """Publish enriched event to the agent trigger topic."""
    topic_path = publisher.topic_path(PROJECT_ID, TRIGGER_TOPIC)
    data = json.dumps(enriched_event).encode("utf-8")
    future = publisher.publish(topic_path, data)
    msg_id = future.result()
    return msg_id


def process_message(message_data: bytes, source_topic: str) -> dict:
    """Full pipeline: filter -> enrich -> interpret -> publish trigger."""
    event = json.loads(message_data)
    event["_source_topic"] = source_topic

    # 1. FILTER
    if not should_pass_filter(event):
        print(f"  FILTERED: {event.get('event_type')} for {event.get('customer_id')} (below threshold)")
        return None

    # 2. ENRICH
    enriched = enrich(event)
    if not enriched.get("enriched"):
        print(f"  ENRICH FAILED: {enriched.get('enrichment_error')}")
        return None

    # 3. INTERPRET
    signal = interpret(enriched)
    print(f"  SIGNAL: {signal['signal_type']} | urgency: {signal['urgency']} | {signal['raw_event_summary']}")

    # 4. PUBLISH TRIGGER
    if signal["in_pilot_segment"] and signal["contact_allowed"]:
        msg_id = publish_trigger(signal)
        print(f"  TRIGGERED: published to {TRIGGER_TOPIC} (msg: {msg_id})")
    else:
        print(f"  SKIPPED: not in pilot segment or contact not allowed")

    return signal


def pull_once(topic_filter: str = None):
    """Pull messages from subscriptions once (non-streaming)."""
    subscriber = pubsub_v1.SubscriberClient()

    subs = {
        "billing": "jio-billing-events-processor",
        "network": "jio-network-events-processor",
        "app": "jio-app-events-processor",
        "device": "jio-device-events-processor",
    }

    if topic_filter:
        subs = {k: v for k, v in subs.items() if k == topic_filter}

    total_processed = 0
    total_triggered = 0

    for topic_key, sub_id in subs.items():
        sub_path = subscriber.subscription_path(PROJECT_ID, sub_id)
        print(f"\nPulling from {sub_id}...")

        response = subscriber.pull(
            request={"subscription": sub_path, "max_messages": 10},
            timeout=5,
        )

        if not response.received_messages:
            print("  (no messages)")
            continue

        ack_ids = []
        for msg in response.received_messages:
            result = process_message(msg.message.data, topic_key)
            ack_ids.append(msg.ack_id)
            total_processed += 1
            if result:
                total_triggered += 1

        # Acknowledge processed messages
        if ack_ids:
            subscriber.acknowledge(request={"subscription": sub_path, "ack_ids": ack_ids})

    print(f"\nProcessed: {total_processed} events, Triggered: {total_triggered} signals")


def stream(topic_filter: str = None):
    """Stream messages continuously (blocking)."""
    from concurrent.futures import TimeoutError as FuturesTimeout

    subscriber = pubsub_v1.SubscriberClient()

    subs = {
        "billing": ("jio-billing-events-processor", "billing"),
        "network": ("jio-network-events-processor", "network"),
        "app": ("jio-app-events-processor", "app"),
        "device": ("jio-device-events-processor", "device"),
    }

    if topic_filter:
        subs = {k: v for k, v in subs.items() if k == topic_filter}

    futures = []
    for topic_key, (sub_id, source) in subs.items():
        sub_path = subscriber.subscription_path(PROJECT_ID, sub_id)

        def make_callback(src):
            def callback(message):
                process_message(message.data, src)
                message.ack()
            return callback

        future = subscriber.subscribe(sub_path, callback=make_callback(source))
        futures.append(future)
        print(f"Subscribed to {sub_id}")

    print(f"\nStreaming {len(futures)} subscriptions... (Ctrl+C to stop)")
    try:
        for future in futures:
            future.result()
    except KeyboardInterrupt:
        print("\nStopping...")
        for future in futures:
            future.cancel()


def main():
    parser = argparse.ArgumentParser(description="Jio signal processor")
    parser.add_argument("--topic", choices=["billing", "network", "app", "device"], help="Process one topic only")
    parser.add_argument("--once", action="store_true", help="Pull once and exit (default: stream)")
    args = parser.parse_args()

    if args.once:
        pull_once(args.topic)
    else:
        stream(args.topic)


if __name__ == "__main__":
    main()
