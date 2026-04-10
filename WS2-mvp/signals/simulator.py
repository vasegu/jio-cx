"""Signal simulator - generates realistic events for synthetic Jio customers.

Publishes events to Pub/Sub topics. Run scenarios one-shot or continuously.

Usage:
    python simulator.py                    # run all scenarios once
    python simulator.py --scenario data_cap  # run specific scenario
    python simulator.py --continuous --interval 10  # every 10 seconds
    python simulator.py --list             # list available scenarios
"""

import argparse
import json
import random
import sys
import time
from datetime import datetime
from pathlib import Path

from google.cloud import pubsub_v1

PROJECT_ID = "jiobuddy-492811"

# Load synthetic customer profiles
PROFILES_PATH = Path(__file__).parent.parent / "agent/data/corpus/synthetic/customer-profiles.json"

publisher = pubsub_v1.PublisherClient()


def load_profiles():
    with open(PROFILES_PATH) as f:
        return {p["customer_id"]: p for p in json.load(f)}


def publish(topic_id: str, event: dict):
    """Publish an event to a Pub/Sub topic."""
    topic_path = publisher.topic_path(PROJECT_ID, topic_id)
    data = json.dumps(event).encode("utf-8")
    future = publisher.publish(topic_path, data)
    msg_id = future.result()
    print(f"  published to {topic_id}: {event.get('event_type', '?')} for {event.get('customer_id', '?')} (msg: {msg_id})")
    return msg_id


# --- SCENARIOS ---

def scenario_approaching_data_cap(profiles: dict):
    """Customer approaching their data cap - billing signal."""
    # Pick early-life customers with medium/high risk
    candidates = [p for p in profiles.values()
                  if p["tenure_days"] < 90 and p["risk_level"] in ("medium", "high")]
    customer = random.choice(candidates) if candidates else random.choice(list(profiles.values()))

    event = {
        "customer_id": customer["customer_id"],
        "event_type": "data_usage",
        "timestamp": datetime.now().isoformat(),
        "data_used_pct": random.uniform(80, 95),
        "data_used_gb": random.uniform(200, 280),
        "data_limit_gb": 300,
        "plan_name": customer["plan"]["name"],
        "amount_inr": customer["plan"]["price_inr"],
    }
    print(f"\nScenario: APPROACHING DATA CAP")
    print(f"  Customer: {customer['customer_id']} ({customer['name']}, {customer['plan']['name']}, day {customer['tenure_days']})")
    publish("jio-billing-events", event)
    return event


def scenario_network_degraded(profiles: dict):
    """Customer experiencing network quality drop - network signal."""
    customer = random.choice(list(profiles.values()))
    plan_speed = customer["plan"]["speed_mbps"]

    event = {
        "customer_id": customer["customer_id"],
        "event_type": "qoe_drop",
        "timestamp": datetime.now().isoformat(),
        "download_speed_mbps": round(plan_speed * random.uniform(0.1, 0.3), 1),
        "upload_speed_mbps": round(plan_speed * 0.3 * random.uniform(0.1, 0.3), 1),
        "latency_ms": random.randint(80, 300),
        "packet_loss_pct": round(random.uniform(2, 10), 1),
        "wifi_signal": random.choice(["weak", "weak", "medium"]),
        "connection_type": "fiber" if "Fiber" in customer["plan"]["name"] else "FWA",
    }
    print(f"\nScenario: NETWORK DEGRADED")
    print(f"  Customer: {customer['customer_id']} ({customer['name']}, getting {event['download_speed_mbps']}Mbps on {plan_speed}Mbps plan)")
    publish("jio-network-events", event)
    return event


def scenario_cpe_offline(profiles: dict):
    """Customer's router/CPE goes offline - device signal."""
    customer = random.choice(list(profiles.values()))

    event = {
        "customer_id": customer["customer_id"],
        "event_type": "cpe_offline",
        "timestamp": datetime.now().isoformat(),
        "cpe_model": random.choice(["JioFiber Router v2", "JioFiber Router v3", "JioAirFiber CPE"]),
        "cpe_status": "offline",
        "wifi_2g_signal": "",
        "wifi_5g_signal": "",
        "connected_devices": 0,
        "temperature_celsius": 0,
        "uptime_hours": 0,
    }
    print(f"\nScenario: CPE OFFLINE")
    print(f"  Customer: {customer['customer_id']} ({customer['name']}, router went dark)")
    publish("jio-device-events", event)
    return event


def scenario_recharge_expiring(profiles: dict):
    """Customer's plan about to expire, no recharge - billing signal."""
    candidates = [p for p in profiles.values() if p["tenure_days"] < 60]
    customer = random.choice(candidates) if candidates else random.choice(list(profiles.values()))

    event = {
        "customer_id": customer["customer_id"],
        "event_type": "payment_due",
        "timestamp": datetime.now().isoformat(),
        "days_until_due": random.choice([1, 2, 3]),
        "overdue": False,
        "amount_inr": customer["plan"]["price_inr"],
        "plan_name": customer["plan"]["name"],
    }
    print(f"\nScenario: RECHARGE EXPIRING")
    print(f"  Customer: {customer['customer_id']} ({customer['name']}, {event['days_until_due']} days left)")
    publish("jio-billing-events", event)
    return event


def scenario_complaint_page_viewed(profiles: dict):
    """Customer browsing complaint/support pages in app - churn signal."""
    candidates = [p for p in profiles.values() if p["nps_score"] <= 5]
    customer = random.choice(candidates) if candidates else random.choice(list(profiles.values()))

    event = {
        "customer_id": customer["customer_id"],
        "event_type": "page_view",
        "timestamp": datetime.now().isoformat(),
        "page": random.choice(["complaint_form", "cancel_service", "port_out_info", "plan_compare"]),
        "duration_seconds": random.randint(30, 180),
        "session_id": f"sess-{random.randint(10000, 99999)}",
    }
    print(f"\nScenario: CHURN SIGNAL - APP BEHAVIOUR")
    print(f"  Customer: {customer['customer_id']} ({customer['name']}, NPS {customer['nps_score']}, viewed {event['page']})")
    publish("jio-app-events", event)
    return event


def scenario_heavy_streaming(profiles: dict):
    """Household streaming heavily during peak hours - device signal."""
    candidates = [p for p in profiles.values() if p["household_size"] >= 3]
    customer = random.choice(candidates) if candidates else random.choice(list(profiles.values()))

    event = {
        "customer_id": customer["customer_id"],
        "event_type": "heartbeat",
        "timestamp": datetime.now().isoformat(),
        "cpe_model": "JioFiber Router v3",
        "cpe_status": "online",
        "wifi_2g_signal": "medium",
        "wifi_5g_signal": random.choice(["weak", "medium"]),
        "connected_devices": random.randint(8, 15),
        "temperature_celsius": random.randint(55, 70),
        "uptime_hours": random.randint(100, 500),
    }
    print(f"\nScenario: HEAVY STREAMING")
    print(f"  Customer: {customer['customer_id']} ({customer['name']}, {event['connected_devices']} devices, router at {event['temperature_celsius']}C)")
    publish("jio-device-events", event)
    return event


# Scenario registry
SCENARIOS = {
    "data_cap": ("Approaching data cap", scenario_approaching_data_cap),
    "network": ("Network quality drop", scenario_network_degraded),
    "cpe_offline": ("Router/CPE goes offline", scenario_cpe_offline),
    "recharge": ("Recharge expiring soon", scenario_recharge_expiring),
    "churn_app": ("Churn signal from app behaviour", scenario_complaint_page_viewed),
    "streaming": ("Heavy streaming, hot router", scenario_heavy_streaming),
}


def run_all(profiles):
    """Run all scenarios once."""
    print(f"Running all {len(SCENARIOS)} scenarios...")
    for key, (name, fn) in SCENARIOS.items():
        fn(profiles)


def main():
    parser = argparse.ArgumentParser(description="Jio signal simulator")
    parser.add_argument("--scenario", choices=list(SCENARIOS.keys()), help="Run specific scenario")
    parser.add_argument("--continuous", action="store_true", help="Run continuously")
    parser.add_argument("--interval", type=int, default=10, help="Seconds between events in continuous mode")
    parser.add_argument("--list", action="store_true", help="List available scenarios")
    args = parser.parse_args()

    if args.list:
        print("Available scenarios:")
        for key, (name, _) in SCENARIOS.items():
            print(f"  {key:15s} - {name}")
        return

    profiles = load_profiles()
    print(f"Loaded {len(profiles)} customer profiles")

    if args.continuous:
        print(f"Continuous mode - publishing random event every {args.interval}s (Ctrl+C to stop)")
        try:
            while True:
                key = random.choice(list(SCENARIOS.keys()))
                _, fn = SCENARIOS[key]
                fn(profiles)
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\nStopped.")
    elif args.scenario:
        _, fn = SCENARIOS[args.scenario]
        fn(profiles)
    else:
        run_all(profiles)


if __name__ == "__main__":
    main()
