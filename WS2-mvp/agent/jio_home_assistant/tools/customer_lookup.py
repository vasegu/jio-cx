"""Customer profile lookup - mocked for prototype, replace with real API."""

import json
import random

# Deterministic profiles keyed by customer_id for consistent demo behaviour
_DEMO_PROFILES = {
    "JIO-001": {
        "customer_id": "JIO-001",
        "name": "Raj Sharma",
        "plan": {"name": "JioFiber Gold 999", "speed_mbps": 100, "data": "unlimited", "price_inr": 999},
        "tenure_days": 15,
        "language_preference": "hi",
        "channel_preference": "voice",
        "complaints_last_30_days": 2,
        "nps_score": 4,
        "household_size": 4,
        "last_recharge": "2026-04-01",
        "account_status": "active",
    },
    "JIO-002": {
        "customer_id": "JIO-002",
        "name": "Priya Patel",
        "plan": {"name": "JioFiber Diamond 1499", "speed_mbps": 150, "data": "unlimited", "price_inr": 1499},
        "tenure_days": 45,
        "language_preference": "en",
        "channel_preference": "app",
        "complaints_last_30_days": 0,
        "nps_score": 8,
        "household_size": 3,
        "last_recharge": "2026-03-28",
        "account_status": "active",
    },
    "JIO-003": {
        "customer_id": "JIO-003",
        "name": "Amit Kumar",
        "plan": {"name": "JioAirFiber 599", "speed_mbps": 30, "data": "unlimited", "price_inr": 599},
        "tenure_days": 8,
        "language_preference": "hinglish",
        "channel_preference": "whatsapp",
        "complaints_last_30_days": 1,
        "nps_score": 5,
        "household_size": 5,
        "last_recharge": "2026-04-05",
        "account_status": "active",
    },
}


def get_customer_profile(customer_id: str) -> str:
    """Look up a customer's profile including plan, tenure, and history.

    Args:
        customer_id: Jio customer ID (e.g. JIO-001)

    Returns:
        Customer profile with plan details, tenure, and recent history
    """
    if customer_id in _DEMO_PROFILES:
        return json.dumps(_DEMO_PROFILES[customer_id], indent=2)

    # Random profile for unknown IDs
    plans = [
        {"name": "JioFiber Silver 599", "speed_mbps": 30, "data": "unlimited", "price_inr": 599},
        {"name": "JioFiber Gold 999", "speed_mbps": 100, "data": "unlimited", "price_inr": 999},
        {"name": "JioFiber Diamond 1499", "speed_mbps": 150, "data": "unlimited", "price_inr": 1499},
        {"name": "JioFiber Platinum 2499", "speed_mbps": 300, "data": "unlimited", "price_inr": 2499},
        {"name": "JioAirFiber 599", "speed_mbps": 30, "data": "unlimited", "price_inr": 599},
    ]
    names = ["Sneha Gupta", "Vikram Singh", "Meera Nair", "Arjun Reddy", "Kavita Joshi"]
    return json.dumps({
        "customer_id": customer_id,
        "name": random.choice(names),
        "plan": random.choice(plans),
        "tenure_days": random.randint(5, 90),
        "language_preference": random.choice(["hi", "en", "hinglish"]),
        "channel_preference": random.choice(["app", "voice", "whatsapp"]),
        "complaints_last_30_days": random.randint(0, 3),
        "nps_score": random.randint(3, 10),
        "household_size": random.randint(2, 6),
        "last_recharge": "2026-04-01",
        "account_status": "active",
    }, indent=2)
