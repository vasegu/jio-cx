"""Network diagnostics - mocked for prototype, replace with real OSS APIs."""

import json
import random


def check_connection_status(customer_id: str) -> str:
    """Check if the customer's home broadband connection is active.

    Args:
        customer_id: Jio customer ID

    Returns:
        Connection status including line state, uptime, and last outage
    """
    scenarios = [
        {"line_status": "up", "uptime_hours": 168, "last_outage": "none",
         "connection_type": "fiber", "onu_status": "online"},
        {"line_status": "up", "uptime_hours": 2, "last_outage": "2026-04-10 06:00",
         "connection_type": "fiber", "onu_status": "online"},
        {"line_status": "degraded", "uptime_hours": 12, "last_outage": "2026-04-09 22:30",
         "connection_type": "FWA", "onu_status": "online"},
        {"line_status": "down", "uptime_hours": 0, "last_outage": "2026-04-10 08:15",
         "connection_type": "fiber", "onu_status": "offline"},
    ]
    result = random.choice(scenarios)
    result["customer_id"] = customer_id
    return json.dumps(result, indent=2)


def run_speed_test(customer_id: str) -> str:
    """Run a speed test for the customer's connection.

    Args:
        customer_id: Jio customer ID

    Returns:
        Speed test results: download, upload, latency, jitter, vs plan speed
    """
    plan_speed = random.choice([30, 100, 150, 300, 1000])
    ratio = random.uniform(0.3, 0.95)
    actual = plan_speed * ratio
    return json.dumps({
        "customer_id": customer_id,
        "plan_speed_mbps": plan_speed,
        "actual_download_mbps": round(actual, 1),
        "actual_upload_mbps": round(actual * 0.3, 1),
        "latency_ms": random.randint(5, 80),
        "jitter_ms": random.randint(1, 20),
        "packet_loss_pct": round(random.uniform(0, 3), 1),
        "test_server": "Mumbai",
        "speed_ratio": round(ratio, 2),
        "assessment": "good" if ratio > 0.7 else "degraded" if ratio > 0.4 else "poor",
    }, indent=2)


def check_router_health(customer_id: str) -> str:
    """Check the health of the customer's home router/CPE.

    Args:
        customer_id: Jio customer ID

    Returns:
        Router diagnostics: model, firmware, wifi signal, channels, temperature
    """
    signal_2g = random.choice(["strong", "medium", "weak"])
    signal_5g = random.choice(["strong", "medium", "weak"])
    congestion = random.choice(["low", "medium", "high"])
    temp = random.randint(35, 65)

    issues = []
    if signal_2g == "weak" or signal_5g == "weak":
        issues.append("weak wifi signal detected - customer may be far from router")
    if congestion == "high":
        issues.append("high channel congestion - neighbouring networks causing interference")
    if temp > 55:
        issues.append("router running hot - check ventilation")

    return json.dumps({
        "customer_id": customer_id,
        "router_model": random.choice(["JioFiber Router v2", "JioFiber Router v3", "JioAirFiber CPE"]),
        "firmware_version": "3.2.1",
        "firmware_up_to_date": random.choice([True, True, False]),
        "wifi_2g_signal": signal_2g,
        "wifi_5g_signal": signal_5g,
        "channel_2g": random.randint(1, 11),
        "channel_5g": random.randint(36, 165),
        "channel_congestion": congestion,
        "temperature_celsius": temp,
        "uptime_hours": random.randint(1, 720),
        "issues": issues,
    }, indent=2)


def restart_router(customer_id: str, confirm: bool = False) -> str:
    """Restart the customer's home router remotely.
    IMPORTANT: Ask the customer for permission before calling with confirm=True.

    Args:
        customer_id: Jio customer ID
        confirm: Must be True to execute. Ask customer permission first.

    Returns:
        Restart status and expected downtime
    """
    if not confirm:
        return json.dumps({
            "status": "confirmation_required",
            "message": "Please confirm with the customer before restarting. "
                       "All devices will disconnect for 2-3 minutes."
        }, indent=2)
    return json.dumps({
        "status": "restarting",
        "customer_id": customer_id,
        "estimated_downtime_seconds": 120,
        "message": "Router restart initiated. Connection will resume in 2-3 minutes."
    }, indent=2)


def check_device_count(customer_id: str) -> str:
    """Check how many devices are connected to the customer's home network.

    Args:
        customer_id: Jio customer ID

    Returns:
        Connected device count, types, and any bandwidth hogs
    """
    count = random.randint(2, 15)
    phones = random.randint(1, min(4, count))
    remaining = count - phones
    laptops = random.randint(0, min(3, remaining))
    remaining -= laptops
    tvs = random.randint(0, min(2, remaining))
    iot = remaining - tvs

    hogs = []
    if tvs > 0 and random.random() > 0.4:
        hogs.append("Smart TV - JioCinema 4K streaming")
    if random.random() > 0.7:
        hogs.append("Laptop - large download in progress")

    return json.dumps({
        "customer_id": customer_id,
        "connected_devices": count,
        "max_recommended": 10,
        "over_limit": count > 10,
        "device_breakdown": {
            "phones": phones,
            "laptops": laptops,
            "smart_tv": tvs,
            "iot_devices": iot,
        },
        "bandwidth_hogs": hogs,
        "recommendation": "Too many devices connected - consider disconnecting unused ones or upgrading plan" if count > 10 else "Device count within normal range",
    }, indent=2)
