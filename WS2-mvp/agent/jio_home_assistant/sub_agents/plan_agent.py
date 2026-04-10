from pathlib import Path
from google.adk.agents import Agent
from google.adk.tools import FunctionTool
from jio_home_assistant.tools.customer_lookup import get_customer_profile
from jio_home_assistant.tools.plan_lookup import search_plans, get_plan_details

_prompt = (Path(__file__).parent.parent / "prompts" / "plan.md").read_text()

plan_agent = Agent(
    model="gemini-2.5-flash",
    name="plan_agent",
    description=(
        "Jio Home broadband plan specialist. "
        "Handles: plan questions, comparisons, upgrades, OTT bundle queries, "
        "pricing, 'which plan is best for me' questions."
    ),
    instruction=_prompt,
    tools=[
        FunctionTool(get_customer_profile),
        FunctionTool(search_plans),
        FunctionTool(get_plan_details),
    ],
)
