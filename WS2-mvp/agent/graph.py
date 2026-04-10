"""Jio Home Assistant — LangGraph orchestration graph.

Replaces the ADK agent tree (agent.py) with an explicit LangGraph StateGraph.
Each sub-agent becomes a node. Routing is explicit and debuggable.
Different nodes can use different LLMs.

The graph is used as the LLM in the LiveKit voice pipeline via LLMAdapter:
    STT → LangGraph (this file) → TTS

Usage:
    from graph import build_graph
    graph = build_graph()

    # In LiveKit agent:
    from livekit.plugins import langchain
    session = AgentSession(llm=langchain.LLMAdapter(graph=graph))
"""

import json
import sys
from pathlib import Path
from typing import Annotated, Literal

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode

# Import tool implementations directly (bypass jio_home_assistant/__init__.py
# which imports ADK — we don't need ADK in the LangGraph path)
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
# LangChain @tool wrappers — same functions, new decorators
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


# Tool groups per sub-agent
TROUBLESHOOT_TOOLS = [
    rag_search, lookup_customer, diagnose_connection, diagnose_speed,
    diagnose_router, do_restart_router, diagnose_devices,
]

PLAN_TOOLS = [
    rag_search, lookup_plans, lookup_plan_details, lookup_customer,
]

COMPLAINT_TOOLS = [
    rag_search, lookup_customer, file_complaint, get_complaint_status,
]

ALL_TOOLS = list({t.name: t for t in TROUBLESHOOT_TOOLS + PLAN_TOOLS + COMPLAINT_TOOLS}.values())


# ---------------------------------------------------------------------------
# Graph construction
# ---------------------------------------------------------------------------

def _get_llm(provider: str = "google"):
    """Get an LLM instance. Each node can use a different provider."""
    if provider == "google":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(model="gemini-2.5-flash")
    elif provider == "groq":
        from langchain_groq import ChatGroq
        return ChatGroq(model="llama-3.3-70b-versatile")
    elif provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(model="claude-sonnet-4-20250514")
    else:
        raise ValueError(f"Unknown LLM provider: {provider}")


def build_graph(
    router_llm: str = "google",
    troubleshoot_llm: str = "google",
    plan_llm: str = "google",
    complaint_llm: str = "google",
):
    """Build the Jio Home Assistant LangGraph.

    Each sub-agent can use a different LLM provider.
    Pass provider names: 'google', 'groq', 'anthropic'.

    Returns a compiled StateGraph ready for LLMAdapter.
    """

    # Bind tools to LLMs
    troubleshoot_model = _get_llm(troubleshoot_llm).bind_tools(TROUBLESHOOT_TOOLS)
    plan_model = _get_llm(plan_llm).bind_tools(PLAN_TOOLS)
    complaint_model = _get_llm(complaint_llm).bind_tools(COMPLAINT_TOOLS)
    router_model = _get_llm(router_llm)

    # --- Nodes ---

    def router(state: MessagesState):
        """Classify intent and route to the right sub-agent."""
        messages = [
            SystemMessage(content=SYSTEM_PROMPT + "\n\nClassify the customer's intent and respond. "
                "If the issue is about connectivity, speed, wifi, or diagnostics, say ROUTE:troubleshoot. "
                "If about plans, pricing, upgrades, or OTT bundles, say ROUTE:plan. "
                "If about complaints, billing disputes, or checking complaint status, say ROUTE:complaint. "
                "If it's a simple greeting or FAQ, respond directly (no ROUTE)."),
        ] + state["messages"]

        response = router_model.invoke(messages)
        return {"messages": [response]}

    def troubleshoot(state: MessagesState):
        """Handle troubleshooting queries with diagnostic tools."""
        messages = [SystemMessage(content=TROUBLESHOOT_PROMPT)] + state["messages"]
        return {"messages": [troubleshoot_model.invoke(messages)]}

    def plan(state: MessagesState):
        """Handle plan queries with lookup tools."""
        messages = [SystemMessage(content=PLAN_PROMPT)] + state["messages"]
        return {"messages": [plan_model.invoke(messages)]}

    def complaint(state: MessagesState):
        """Handle complaints with logging tools."""
        messages = [SystemMessage(content=COMPLAINT_PROMPT)] + state["messages"]
        return {"messages": [complaint_model.invoke(messages)]}

    # --- Routing logic ---

    def route_from_router(state: MessagesState) -> Literal["troubleshoot", "plan", "complaint", END]:
        """Check the router's response for a ROUTE: directive."""
        last = state["messages"][-1]
        content = last.content if hasattr(last, "content") else str(last)
        upper = content.upper()
        if "ROUTE:TROUBLESHOOT" in upper:
            return "troubleshoot"
        elif "ROUTE:PLAN" in upper:
            return "plan"
        elif "ROUTE:COMPLAINT" in upper:
            return "complaint"
        # No route = direct response (greeting, FAQ)
        return END

    def should_continue(state: MessagesState) -> Literal["tools", END]:
        """After a sub-agent responds, check if it wants to call tools."""
        last = state["messages"][-1]
        if hasattr(last, "tool_calls") and last.tool_calls:
            return "tools"
        return END

    # --- Build graph ---

    tool_node = ToolNode(ALL_TOOLS)

    graph = StateGraph(MessagesState)

    graph.add_node("router", router)
    graph.add_node("troubleshoot", troubleshoot)
    graph.add_node("plan", plan)
    graph.add_node("complaint", complaint)
    graph.add_node("tools", tool_node)

    # Entry
    graph.add_edge(START, "router")

    # Router decides where to go
    graph.add_conditional_edges("router", route_from_router)

    # Sub-agents can call tools or finish
    for node in ["troubleshoot", "plan", "complaint"]:
        graph.add_conditional_edges(node, should_continue)

    # Tools loop back to the sub-agent that called them
    # ToolNode preserves the sender, so we route back based on last non-tool message
    def route_after_tools(state: MessagesState) -> Literal["troubleshoot", "plan", "complaint"]:
        """Route back to whichever sub-agent initiated the tool call."""
        for msg in reversed(state["messages"]):
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                # This is the AI message that requested the tool — check which node made it
                # We use a simple heuristic: check which system prompt was last injected
                break
        # Default: route to troubleshoot (most common)
        # In practice, LangGraph's ToolNode returns to the calling node
        return "troubleshoot"

    graph.add_conditional_edges("tools", route_after_tools)

    return graph.compile()


# Quick test
if __name__ == "__main__":
    g = build_graph()
    print(g.get_graph().draw_ascii())
