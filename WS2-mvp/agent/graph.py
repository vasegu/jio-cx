"""Jio Home Assistant — LangGraph orchestration graph with voice separation.

Voice separation pattern (from EnterpriseAgentMap):
- Nodes reason internally and set voice_instructions + voice_data in state
- A single compute_output node synthesizes the spoken response
- ONLY compute_output produces an AIMessage
- Nothing else reaches TTS

Graph structure:
    START → router → [troubleshoot | plan | complaint] ↔ tools → compute_output → END
                                                                       ↑
                                                          ONLY node that speaks
"""

import json
import os
import sys
from pathlib import Path
from typing import Annotated, Any, Literal, TypedDict

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, MessagesState, START, END, add_messages
from langgraph.prebuilt import ToolNode
from langgraph.types import StreamWriter

# Import tool implementations directly (bypass ADK __init__)
TOOLS_DIR = Path(__file__).parent / "jio_home_assistant" / "tools"
sys.path.insert(0, str(TOOLS_DIR))

from rag_search import jio_knowledge_search
from plan_lookup import search_plans, get_plan_details
from customer_lookup import get_customer_profile
from network_diagnostics import (
    check_connection_status, run_speed_test, check_router_health,
    restart_router, check_device_count,
)
from complaint_ops import log_complaint, check_complaint_status

# Load prompts
PROMPTS_DIR = Path(__file__).parent / "jio_home_assistant" / "prompts"
SYSTEM_PROMPT = (PROMPTS_DIR / "system.md").read_text()
TROUBLESHOOT_PROMPT = (PROMPTS_DIR / "troubleshoot.md").read_text()
PLAN_PROMPT = (PROMPTS_DIR / "plan.md").read_text()
COMPLAINT_PROMPT = (PROMPTS_DIR / "complaint.md").read_text()


# ---------------------------------------------------------------------------
# State — extends MessagesState with voice separation fields
# ---------------------------------------------------------------------------

class JioState(TypedDict):
    messages: Annotated[list, add_messages]  # append-only conversation history
    route: str  # where the router sent us: troubleshoot | plan | complaint | ""
    voice_instructions: str  # WHAT to say (set by sub-agents)
    voice_data: dict  # structured facts to reference (set by sub-agents)
    customer_language: str  # detected language for synthesis


# ---------------------------------------------------------------------------
# Tool wrappers — same functions, @tool decorators
# ---------------------------------------------------------------------------

@tool
def rag_search(query: str) -> str:
    """Search the Jio knowledge base for broadband plans, pricing, OTT bundles,
    troubleshooting steps, billing, and FAQs. Works with Hindi, Hinglish, English.
    ALWAYS use before answering factual Jio questions."""
    return jio_knowledge_search(query)

@tool
def lookup_plans(plan_type: str = "", max_price: int = 0, min_speed: int = 0, includes_ott: str = "") -> str:
    """Search Jio Home broadband plans matching criteria."""
    kwargs = {}
    if plan_type: kwargs["plan_type"] = plan_type
    if max_price: kwargs["max_price"] = max_price
    if min_speed: kwargs["min_speed"] = min_speed
    if includes_ott: kwargs["includes_ott"] = includes_ott
    return search_plans(**kwargs)

@tool
def lookup_plan_details(plan_id: str) -> str:
    """Get full details for a specific Jio plan by ID (e.g. 'fiber-gold-999')."""
    return get_plan_details(plan_id)

@tool
def lookup_customer(customer_id: str) -> str:
    """Look up a customer's profile including plan, tenure, NPS, and history."""
    return get_customer_profile(customer_id)

@tool
def diagnose_connection(customer_id: str) -> str:
    """Check if a customer's home broadband connection is active."""
    return check_connection_status(customer_id)

@tool
def diagnose_speed(customer_id: str) -> str:
    """Run a speed test for a customer's connection."""
    return run_speed_test(customer_id)

@tool
def diagnose_router(customer_id: str) -> str:
    """Check the health of a customer's home router/CPE."""
    return check_router_health(customer_id)

@tool
def do_restart_router(customer_id: str, confirm: bool = False) -> str:
    """Restart a customer's router remotely. MUST get customer permission first."""
    return restart_router(customer_id, confirm=confirm)

@tool
def diagnose_devices(customer_id: str) -> str:
    """Check how many devices are connected to a customer's network."""
    return check_device_count(customer_id)

@tool
def file_complaint(customer_id: str, category: str, description: str, priority: str = "medium") -> str:
    """Log a new customer complaint. Categories: connectivity, speed, billing, router, other."""
    return log_complaint(customer_id, category, description, priority=priority)

@tool
def get_complaint_status(reference: str = "", customer_id: str = "") -> str:
    """Check status of an existing complaint by reference number or customer ID."""
    kwargs = {}
    if reference: kwargs["reference"] = reference
    if customer_id: kwargs["customer_id"] = customer_id
    return check_complaint_status(**kwargs)


ALL_TOOLS = [
    rag_search, lookup_plans, lookup_plan_details, lookup_customer,
    diagnose_connection, diagnose_speed, diagnose_router,
    do_restart_router, diagnose_devices, file_complaint, get_complaint_status,
]


# ---------------------------------------------------------------------------
# LLM factory
# ---------------------------------------------------------------------------

def _get_llm(provider: str = "google"):
    if provider == "google":
        from langchain_google_genai import ChatGoogleGenerativeAI
        # ChatGoogleGenerativeAI supports both Developer API and Vertex AI
        # via GOOGLE_GENAI_USE_VERTEXAI env var (handled by google-genai SDK)
        return ChatGoogleGenerativeAI(model="gemini-2.5-flash")
    elif provider == "groq":
        from langchain_groq import ChatGroq
        return ChatGroq(model="llama-3.3-70b-versatile")
    elif provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(model="claude-sonnet-4-20250514")
    raise ValueError(f"Unknown LLM provider: {provider}")


# ---------------------------------------------------------------------------
# Graph builder
# ---------------------------------------------------------------------------

def build_graph(
    router_llm: str = "google",
    agent_llm: str = "google",
    synthesis_llm: str = "google",
):
    """Build the Jio Home Assistant graph with voice separation.

    Args:
        router_llm: Provider for intent classification
        agent_llm: Provider for sub-agent reasoning + tool calling
        synthesis_llm: Provider for voice synthesis (compute_output)
    """

    router_model = _get_llm(router_llm)
    agent_model = _get_llm(agent_llm).bind_tools(ALL_TOOLS)
    synthesis_model = _get_llm(synthesis_llm)

    # --- Nodes ---

    def router(state: JioState):
        """LLM-based intent classification. Sets route in state, NOT AIMessage.

        Internal reasoning — nothing reaches TTS.
        For greetings, sets voice_instructions directly.
        """
        user_messages = [m for m in state["messages"] if isinstance(m, HumanMessage)]
        if not user_messages:
            return {
                "route": "",
                "voice_instructions": "Greet the customer warmly and offer assistance.",
                "voice_data": {},
            }

        messages = [
            SystemMessage(content=(
                "You are an intent classifier for a Jio Home broadband assistant.\n"
                "Analyze the customer's message and respond with EXACTLY one word:\n"
                "- troubleshoot — for connectivity, speed, wifi, router, diagnostic issues\n"
                "- plan — for plan questions, pricing, upgrades, OTT bundles, comparisons\n"
                "- complaint — for complaints, billing disputes, complaint status\n"
                "- greeting — for hellos, how are you, general chitchat\n\n"
                "Output ONLY the single word. Nothing else."
            )),
        ] + state["messages"]

        response = router_model.invoke(messages)
        classification = response.content.strip().lower()

        if "troubleshoot" in classification:
            return {"route": "troubleshoot"}
        elif "plan" in classification:
            return {"route": "plan"}
        elif "complaint" in classification:
            return {"route": "complaint"}
        else:
            # Greeting or unclassified — respond directly
            return {
                "route": "",
                "voice_instructions": "Respond to the customer's greeting warmly. Offer to help with their Jio Home broadband.",
                "voice_data": {},
            }

    def agent_node(state: JioState):
        """Unified sub-agent: reasons about the query, calls tools as needed.

        Uses the route to select the right system prompt.
        Returns AIMessage (with tool_calls or final response).
        """
        route = state.get("route", "troubleshoot")
        prompt_map = {
            "troubleshoot": TROUBLESHOOT_PROMPT,
            "plan": PLAN_PROMPT,
            "complaint": COMPLAINT_PROMPT,
        }
        prompt = prompt_map.get(route, SYSTEM_PROMPT)

        # Filter out empty AIMessages and build clean history
        clean = [m for m in state["messages"]
                 if not (isinstance(m, AIMessage) and not m.content and not getattr(m, "tool_calls", None))]

        # Ensure there's at least one HumanMessage (Vertex AI requirement)
        if not any(isinstance(m, HumanMessage) for m in clean):
            clean.append(HumanMessage(content="Help me with my query."))

        messages = [SystemMessage(content=prompt)] + clean
        response = agent_model.invoke(messages)
        return {"messages": [response]}

    def should_use_tools(state: JioState) -> Literal["tools", "extract"]:
        """After agent responds, check if it wants tools or is done."""
        last = state["messages"][-1]
        if hasattr(last, "tool_calls") and last.tool_calls:
            return "tools"
        return "extract"

    def extract_voice_state(state: JioState):
        """Extract the agent's final response into voice_instructions + voice_data.

        This is the bridge between LLM reasoning and voice synthesis.
        The agent's AIMessage content becomes voice_instructions.
        Any structured data from tool results becomes voice_data.
        """
        # Find the agent's last response (non-tool AIMessage with content)
        agent_response = ""
        for msg in reversed(state["messages"]):
            if isinstance(msg, AIMessage) and msg.content and not getattr(msg, "tool_calls", None):
                content = msg.content
                # Handle list content (Vertex AI sometimes returns list of dicts)
                if isinstance(content, list):
                    agent_response = " ".join(
                        item.get("text", "") if isinstance(item, dict) else str(item)
                        for item in content
                    )
                else:
                    agent_response = content
                break

        # Collect tool results as structured data
        tool_data = {}
        for msg in state["messages"]:
            if isinstance(msg, ToolMessage) and msg.content:
                try:
                    tool_data[msg.name] = json.loads(msg.content)
                except (json.JSONDecodeError, TypeError):
                    tool_data[msg.name] = msg.content

        return {
            "voice_instructions": agent_response or "I wasn't able to find an answer. Let me connect you with someone who can help.",
            "voice_data": tool_data,
        }

    def compute_output(state: JioState, writer: StreamWriter):
        """THE ONLY NODE THAT SPEAKS. Synthesizes voice_instructions through brand voice.

        Streams tokens via writer() → stream_mode="custom" → TTS.
        Also returns the full AIMessage for conversation history.
        """
        instructions = state.get("voice_instructions", "")
        voice_data = state.get("voice_data", {})

        if not instructions:
            return {"messages": [AIMessage(content="How can I help you?")]}

        # Detect language from conversation
        last_user = ""
        for msg in reversed(state["messages"]):
            if isinstance(msg, HumanMessage):
                last_user = msg.content
                break

        # Detect language from the FIRST user message (sets tone for whole conversation)
        first_user = ""
        for msg in state["messages"]:
            if isinstance(msg, HumanMessage):
                first_user = msg.content
                break

        synthesis_prompt = (
            "You are the voice of Jio's home broadband assistant. "
            "Your job is to speak the following response naturally.\n\n"
            "CRITICAL RULES:\n"
            "- LANGUAGE: The customer's first message was: \"{first_user}\". "
            "Respond in the SAME language they used. If they spoke English, respond in English. "
            "If Hindi, respond in Hindi. Do NOT switch languages between turns.\n"
            "- LENGTH: Maximum 3-4 sentences. This is spoken aloud — long responses kill the experience. "
            "Summarize, don't list everything. Mention 2-3 key highlights, then offer to go deeper.\n"
            "- FORMAT: No markdown, no bullet points, no asterisks, no emojis, no numbered lists. "
            "Pure spoken sentences with natural pauses (commas).\n"
            "- TONE: Warm but efficient. Like a helpful friend, not a brochure.\n\n"
            f"Customer just said: {last_user}\n\n"
            f"What to communicate:\n{instructions[:1000]}\n"
        ).format(first_user=first_user)

        if voice_data:
            # Only pass a brief summary of data, not the full dump
            data_summary = json.dumps(voice_data, indent=2)[:800]
            synthesis_prompt += f"\nKey data to reference (pick the most relevant facts):\n{data_summary}\n"

        messages = [
            SystemMessage(content=synthesis_prompt),
            HumanMessage(content="Speak this response."),
        ]

        # Stream tokens via custom events so TTS starts immediately
        full_response = ""
        for chunk in synthesis_model.stream(messages):
            token = chunk.content if hasattr(chunk, "content") else ""
            if token:
                full_response += token
                writer(token)  # emit to stream_mode="custom" → TTS

        return {"messages": [AIMessage(content=full_response)]}

    # --- Routing ---

    def route_from_router(state: JioState) -> Literal["agent", "compute_output"]:
        route = state.get("route", "")
        if route in ("troubleshoot", "plan", "complaint"):
            return "agent"
        return "compute_output"  # greeting — go straight to synthesis

    # --- Build graph ---

    tool_node = ToolNode(ALL_TOOLS)

    graph = StateGraph(JioState)

    graph.add_node("router", router)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)
    graph.add_node("extract", extract_voice_state)
    graph.add_node("compute_output", compute_output)

    graph.add_edge(START, "router")
    graph.add_conditional_edges("router", route_from_router)
    graph.add_conditional_edges("agent", should_use_tools)
    graph.add_edge("tools", "agent")  # tool results loop back to agent
    graph.add_edge("extract", "compute_output")
    graph.add_edge("compute_output", END)

    return graph.compile()


if __name__ == "__main__":
    g = build_graph()
    print(g.get_graph().draw_ascii())
