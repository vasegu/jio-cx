"""Jio Home Assistant - master orchestrator agent.

Routes to specialist sub-agents for troubleshooting, plans, and complaints.
RAG-grounded via Vertex AI RAG corpus in europe-west1.
Swap model to 'gemini-live-2.5-flash-native-audio' for voice mode.
"""

from pathlib import Path
from google.adk.agents import Agent
from google.adk.tools import FunctionTool

from jio_home_assistant.sub_agents import troubleshoot_agent, plan_agent, complaint_agent
from jio_home_assistant.tools.rag_search import jio_knowledge_search

_system_prompt = (Path(__file__).parent / "prompts" / "system.md").read_text()

# Text mode for dev/testing (works with adk web text chat)
MODEL = "gemini-2.5-flash"
# Voice mode (only works with Audio button, not text):
# MODEL = "gemini-live-2.5-flash-native-audio"

root_agent = Agent(
    model=MODEL,
    name="jio_home_assistant",
    description=(
        "Jio Home broadband customer assistant. Routes to specialists "
        "for troubleshooting, plan recommendations, and complaints."
    ),
    instruction=_system_prompt,
    tools=[FunctionTool(jio_knowledge_search)],
    sub_agents=[
        troubleshoot_agent,
        plan_agent,
        complaint_agent,
    ],
)
