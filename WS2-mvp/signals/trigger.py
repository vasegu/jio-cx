"""Agent trigger - pulls enriched events from jio-agent-triggers and sends them
to the deployed agent for proactive decision-making.

This closes the OODA loop: OBSERVE (simulator) -> ORIENT+DECIDE (processor) -> ACT (agent)

Usage:
    python trigger.py              # pull and process once
    python trigger.py --stream     # stream continuously
"""

import argparse
import json
import os

from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent.parent / "agent" / ".env")

os.environ.setdefault('GOOGLE_CLOUD_PROJECT', 'jiobuddy-492811')
os.environ.setdefault('GOOGLE_CLOUD_LOCATION', 'us-central1')
os.environ.setdefault('GOOGLE_GENAI_USE_VERTEXAI', 'TRUE')

import vertexai
from vertexai import agent_engines
from google.cloud import pubsub_v1

PROJECT_ID = "jiobuddy-492811"
SUBSCRIPTION = "jio-agent-triggers-agent"
AGENT_RESOURCE = "projects/896447499660/locations/us-central1/reasoningEngines/2407535190399254528"

vertexai.init(project=PROJECT_ID, location="us-central1")


def get_agent():
    return agent_engines.get(AGENT_RESOURCE)


def build_agent_prompt(signal: dict) -> str:
    """Convert an enriched signal into a prompt the agent can act on proactively."""
    return f"""PROACTIVE TRIGGER - You are reaching out to a customer, they did not contact you.

Signal: {signal['signal_type']}
Urgency: {signal['urgency']}
Summary: {signal['raw_event_summary']}

Customer:
- Name: {signal['customer_name']}
- ID: {signal['customer_id']}
- Language: {signal['customer_language']}
- Plan: {signal['customer_plan']}
- Tenure: {signal['customer_tenure_days']} days
- NPS: {signal['customer_nps']}
- Risk: {signal['customer_risk']}
- Preferred channel: {signal['customer_channel']}
- Previous complaints: {signal['customer_complaints']}
- Household size: {signal['customer_household_size']}

Exposure mode: {signal['exposure_mode']}

Based on this signal and customer context, decide:
1. Should you reach out? (yes/no and why)
2. If yes, what message would you send? Write it in the customer's language ({signal['customer_language']}).
3. What channel? ({signal['customer_channel']})
4. What's the goal of this outreach?
5. What follow-up should be scheduled?

If exposure mode is "shadow", still decide and write the message, but note that it would NOT be sent (shadow mode - logged only)."""


def process_trigger(signal: dict, agent, session_id: str):
    """Send an enriched signal to the agent for proactive decision-making."""
    prompt = build_agent_prompt(signal)

    print(f"\n{'='*60}")
    print(f"TRIGGER: {signal['signal_type']} | {signal['urgency']} urgency")
    print(f"CUSTOMER: {signal['customer_name']} ({signal['customer_id']}, {signal['customer_language']})")
    print(f"SUMMARY: {signal['raw_event_summary']}")
    print(f"MODE: {signal['exposure_mode']}")
    print(f"{'='*60}")

    final_text = ""
    tools_used = []

    for chunk in agent.stream_query(
        user_id=f"proactive-{signal['customer_id']}",
        session_id=session_id,
        message=prompt,
    ):
        if isinstance(chunk, dict):
            content = chunk.get("content", {})
            parts = content.get("parts", [])
            for part in parts:
                if isinstance(part, dict):
                    if "function_call" in part:
                        tools_used.append(part["function_call"]["name"])
                    if "text" in part:
                        final_text = part["text"]

    if tools_used:
        print(f"TOOLS: {' -> '.join(tools_used)}")
    print(f"\nAGENT DECISION:\n{final_text}")
    print(f"{'='*60}\n")

    return {
        "signal": signal,
        "decision": final_text,
        "tools_used": tools_used,
    }


def pull_once():
    """Pull triggers from Pub/Sub and process once."""
    subscriber = pubsub_v1.SubscriberClient()
    sub_path = subscriber.subscription_path(PROJECT_ID, SUBSCRIPTION)

    agent = get_agent()

    print("Pulling from jio-agent-triggers...")
    response = subscriber.pull(
        request={"subscription": sub_path, "max_messages": 10},
        timeout=5,
    )

    if not response.received_messages:
        print("No pending triggers.")
        return

    print(f"Found {len(response.received_messages)} trigger(s)\n")

    ack_ids = []
    for msg in response.received_messages:
        signal = json.loads(msg.message.data)

        # Create a session per customer interaction
        session = agent.create_session(user_id=f"proactive-{signal['customer_id']}")
        process_trigger(signal, agent, session["id"])
        ack_ids.append(msg.ack_id)

    subscriber.acknowledge(request={"subscription": sub_path, "ack_ids": ack_ids})
    print(f"Processed {len(ack_ids)} trigger(s)")


def stream():
    """Stream triggers continuously."""
    subscriber = pubsub_v1.SubscriberClient()
    sub_path = subscriber.subscription_path(PROJECT_ID, SUBSCRIPTION)

    agent = get_agent()

    def callback(message):
        signal = json.loads(message.data)
        session = agent.create_session(user_id=f"proactive-{signal['customer_id']}")
        process_trigger(signal, agent, session["id"])
        message.ack()

    future = subscriber.subscribe(sub_path, callback=callback)
    print("Streaming agent triggers... (Ctrl+C to stop)")
    try:
        future.result()
    except KeyboardInterrupt:
        future.cancel()
        print("\nStopped.")


def main():
    parser = argparse.ArgumentParser(description="Agent trigger - connect signals to agent")
    parser.add_argument("--stream", action="store_true", help="Stream continuously")
    args = parser.parse_args()

    if args.stream:
        stream()
    else:
        pull_once()


if __name__ == "__main__":
    main()
