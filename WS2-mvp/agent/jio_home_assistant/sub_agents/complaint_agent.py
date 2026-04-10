from pathlib import Path
from google.adk.agents import Agent
from google.adk.tools import FunctionTool
from jio_home_assistant.tools.customer_lookup import get_customer_profile
from jio_home_assistant.tools.complaint_ops import log_complaint, check_complaint_status

_prompt = (Path(__file__).parent.parent / "prompts" / "complaint.md").read_text()

complaint_agent = Agent(
    model="gemini-2.5-flash",
    name="complaint_agent",
    description=(
        "Jio Home broadband complaint specialist. "
        "Handles: logging new complaints, checking complaint status, "
        "billing disputes, refund queries, escalations."
    ),
    instruction=_prompt,
    tools=[
        FunctionTool(get_customer_profile),
        FunctionTool(log_complaint),
        FunctionTool(check_complaint_status),
    ],
)
