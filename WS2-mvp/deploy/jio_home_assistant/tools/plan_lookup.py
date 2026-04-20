"""Plan lookup - hardcoded catalog for prototype, replace with real API/DB."""

import json

PLANS = [
    {
        "id": "fiber-silver-599",
        "name": "JioFiber Silver 599",
        "type": "fiber",
        "price_inr": 599,
        "speed_mbps": 30,
        "data": "unlimited",
        "ott_bundles": ["JioTV+"],
        "max_devices": 10,
        "features": ["30 Mbps speed", "Unlimited data", "JioTV+ included"],
    },
    {
        "id": "fiber-gold-999",
        "name": "JioFiber Gold 999",
        "type": "fiber",
        "price_inr": 999,
        "speed_mbps": 100,
        "data": "unlimited",
        "ott_bundles": ["JioTV+", "JioCinema Premium"],
        "max_devices": 15,
        "features": ["100 Mbps speed", "Unlimited data", "JioTV+ & JioCinema Premium", "Free router"],
    },
    {
        "id": "fiber-diamond-1499",
        "name": "JioFiber Diamond 1499",
        "type": "fiber",
        "price_inr": 1499,
        "speed_mbps": 150,
        "data": "unlimited",
        "ott_bundles": ["JioTV+", "JioCinema Premium", "Netflix Basic"],
        "max_devices": 20,
        "features": ["150 Mbps speed", "Unlimited data", "JioTV+ & JioCinema & Netflix Basic"],
    },
    {
        "id": "fiber-platinum-2499",
        "name": "JioFiber Platinum 2499",
        "type": "fiber",
        "price_inr": 2499,
        "speed_mbps": 300,
        "data": "unlimited",
        "ott_bundles": ["JioTV+", "JioCinema Premium", "Netflix Standard", "Amazon Prime"],
        "max_devices": 30,
        "features": ["300 Mbps speed", "Unlimited data", "All major OTT platforms included"],
    },
    {
        "id": "fiber-titanium-3999",
        "name": "JioFiber Titanium 3999",
        "type": "fiber",
        "price_inr": 3999,
        "speed_mbps": 1000,
        "data": "unlimited",
        "ott_bundles": ["JioTV+", "JioCinema Premium", "Netflix Premium", "Amazon Prime", "Disney+ Hotstar"],
        "max_devices": 50,
        "features": ["1 Gbps speed", "Unlimited data", "All OTT platforms", "Priority support"],
    },
    {
        "id": "airfiber-599",
        "name": "JioAirFiber 599",
        "type": "airfiber",
        "price_inr": 599,
        "speed_mbps": 30,
        "data": "unlimited",
        "ott_bundles": ["JioTV+"],
        "max_devices": 10,
        "features": ["30 Mbps wireless", "No installation needed", "Plug and play"],
    },
    {
        "id": "airfiber-999",
        "name": "JioAirFiber 999",
        "type": "airfiber",
        "price_inr": 999,
        "speed_mbps": 100,
        "data": "unlimited",
        "ott_bundles": ["JioTV+", "JioCinema Premium"],
        "max_devices": 15,
        "features": ["100 Mbps wireless", "No installation needed", "JioTV+ & JioCinema"],
    },
]


def search_plans(
    plan_type: str = None,
    max_price: int = None,
    min_speed: int = None,
    includes_ott: str = None,
) -> str:
    """Search Jio Home broadband plans matching criteria.

    Args:
        plan_type: filter by type - 'fiber' or 'airfiber'. omit for all.
        max_price: maximum monthly price in INR
        min_speed: minimum speed in Mbps
        includes_ott: OTT service name that must be included (e.g. 'Netflix', 'JioCinema')

    Returns:
        List of matching plans with full details
    """
    filtered = PLANS
    if plan_type:
        filtered = [p for p in filtered if p["type"] == plan_type]
    if max_price:
        filtered = [p for p in filtered if p["price_inr"] <= max_price]
    if min_speed:
        filtered = [p for p in filtered if p["speed_mbps"] >= min_speed]
    if includes_ott:
        ott_lower = includes_ott.lower()
        filtered = [
            p for p in filtered
            if any(ott_lower in bundle.lower() for bundle in p["ott_bundles"])
        ]

    if not filtered:
        return json.dumps({"message": "No plans match your criteria", "plans": []}, indent=2)
    return json.dumps({"plans": filtered, "count": len(filtered)}, indent=2)


def get_plan_details(plan_id: str) -> str:
    """Get full details for a specific plan.

    Args:
        plan_id: plan identifier (e.g. 'fiber-gold-999')

    Returns:
        Full plan details including features, OTT bundles, and pricing
    """
    for plan in PLANS:
        if plan["id"] == plan_id:
            return json.dumps(plan, indent=2)
    return json.dumps({"error": f"Plan '{plan_id}' not found"})
