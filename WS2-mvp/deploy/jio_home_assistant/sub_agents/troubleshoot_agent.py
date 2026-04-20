from pathlib import Path
from google.adk.agents import Agent
from google.adk.tools import FunctionTool
from jio_home_assistant.tools.customer_lookup import get_customer_profile
from jio_home_assistant.tools.network_diagnostics import (
    check_connection_status,
    run_speed_test,
    check_router_health,
    restart_router,
    check_device_count,
)

_prompt = (Path(__file__).parent.parent / "prompts" / "troubleshoot.md").read_text()

troubleshoot_agent = Agent(
    model="gemini-2.5-flash",
    name="troubleshoot_agent",
    description=(
        "Diagnoses and resolves Jio Home broadband issues. "
        "Handles: slow internet, no connection, wifi problems, "
        "speed issues, device connectivity, router issues."
    ),
    instruction=_prompt,
    tools=[
        FunctionTool(get_customer_profile),
        FunctionTool(check_connection_status),
        FunctionTool(run_speed_test),
        FunctionTool(check_router_health),
        FunctionTool(restart_router),
        FunctionTool(check_device_count),
    ],
)
