"""Complaint operations - mocked for prototype, replace with real CRM API."""

import json
import random
import datetime

# In-memory complaint store for prototype
_complaints = {}


def log_complaint(
    customer_id: str,
    category: str,
    description: str,
    priority: str = "medium",
) -> str:
    """Log a new customer complaint.

    Args:
        customer_id: Jio customer ID
        category: complaint category - 'connectivity', 'speed', 'billing', 'router', 'other'
        description: customer's description of the issue
        priority: 'low', 'medium', 'high'

    Returns:
        Complaint reference number and expected resolution timeline
    """
    ref = f"CMP-{random.randint(100000, 999999)}"
    now = datetime.datetime.now()

    timelines = {
        "connectivity": "24 hours",
        "speed": "24-48 hours",
        "billing": "3-5 business days",
        "router": "24-48 hours (may require field visit)",
        "other": "48-72 hours",
    }

    complaint = {
        "reference": ref,
        "customer_id": customer_id,
        "category": category,
        "description": description,
        "priority": priority,
        "status": "open",
        "created": now.isoformat(),
        "expected_resolution": timelines.get(category, "48-72 hours"),
        "assigned_to": "Level 1 Support",
    }

    _complaints[ref] = complaint

    return json.dumps({
        "status": "created",
        "reference": ref,
        "expected_resolution": complaint["expected_resolution"],
        "message": f"Complaint {ref} has been logged. "
                   f"Expected resolution: {complaint['expected_resolution']}. "
                   f"You can check status anytime using this reference number.",
    }, indent=2)


def check_complaint_status(reference: str = None, customer_id: str = None) -> str:
    """Check the status of an existing complaint.

    Args:
        reference: complaint reference number (e.g. CMP-123456)
        customer_id: alternatively, look up by customer ID for recent complaints

    Returns:
        Current complaint status and any updates
    """
    # Check in-memory store first
    if reference and reference in _complaints:
        return json.dumps(_complaints[reference], indent=2)

    # Return mocked data for demo
    statuses = [
        {
            "reference": reference or f"CMP-{random.randint(100000, 999999)}",
            "customer_id": customer_id or "unknown",
            "category": "speed",
            "status": "in_progress",
            "created": "2026-04-09T14:30:00",
            "last_update": "2026-04-10T09:15:00",
            "update_notes": "Technician assigned. Network team investigating tower congestion in your area.",
            "expected_resolution": "24 hours",
        },
        {
            "reference": reference or f"CMP-{random.randint(100000, 999999)}",
            "customer_id": customer_id or "unknown",
            "category": "connectivity",
            "status": "resolved",
            "created": "2026-04-08T10:00:00",
            "resolved_at": "2026-04-08T16:45:00",
            "resolution": "Fiber splice issue in building riser. Repaired by field team.",
        },
    ]
    return json.dumps(random.choice(statuses), indent=2)
