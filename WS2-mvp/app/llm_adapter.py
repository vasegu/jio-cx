"""LLM adapter: route fast → filler → graph thinks → synthesis speaks.

Flow:
1. Classify intent via router LLM (~300ms)
2. Emit hardcoded filler to TTS immediately ("Sure, let me pull up our plans")
3. Run full graph with pre-set route (agent + tools + extract, ~3s)
4. Stream synthesis via raw SDK to TTS (token-by-token, ~500ms TTFT)

User hears filler in ~500ms. Real answer follows ~3-5s later.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import queue
import time
from typing import Any

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.runnables import RunnableConfig
from langgraph.pregel.protocol import PregelProtocol

from livekit.agents import llm, utils
from livekit.agents.llm import ToolChoice
from livekit.agents.llm.chat_context import ChatContext
from livekit.agents.types import (
    DEFAULT_API_CONNECT_OPTIONS,
    NOT_GIVEN,
    APIConnectOptions,
    NotGivenOr,
)

log = logging.getLogger("jio-adapter")

# Hardcoded filler by route — no LLM, zero latency, predictable
FILLER_BY_ROUTE = {
    "plan": "Sure, let me pull up our plans.",
    "troubleshoot": "Okay, let me run some checks.",
    "complaint": "I understand. Let me look into this.",
}

# Synthesis prompt — voice-optimized, following:
# LiveKit prompting guide, awesome-voice-prompts, MasterPrompting, ElevenLabs guide
SYNTHESIS_PROMPT = (
    "You are a Jio Home broadband assistant speaking on a phone call.\n\n"
    "HARD RULES:\n"
    "- Maximum 2 sentences. Under 40 words total. No exceptions.\n"
    "- NEVER use markdown, bullet points, asterisks, numbered lists, or emojis.\n"
    "- NEVER say \"I'd be happy to\", \"absolutely\", \"great question\", \"certainly\", \"definitely\".\n"
    "- All numbers in word form: \"five ninety nine rupees per month\" not \"₹599/month\".\n"
    "- All abbreviations spelled out: \"M B P S\" not \"Mbps\".\n"
    "- End with a question or clear invitation: \"Want details on any of these?\"\n"
    "- Match the customer's language. If they spoke English, respond in English.\n\n"
    "PERSONALITY (hearable, not described):\n"
    "- Start responses with natural markers: \"So\", \"Okay so\", \"Right\"\n"
    "- Use contractions: \"you'll get\" not \"you will get\"\n"
    "- One acknowledgment max, then answer. No preamble.\n\n"
    "Customer said: {last_user}\n\n"
    "What to communicate:\n{instructions}\n"
)


def _create_genai_client():
    """Create a Google GenAI client for synthesis streaming."""
    from google import genai
    if os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "").upper() == "TRUE":
        return genai.Client(
            vertexai=True,
            project=os.getenv("GOOGLE_CLOUD_PROJECT", "jiobuddy-492811"),
            location=os.getenv("GOOGLE_CLOUD_LOCATION", "europe-west1"),
        )
    return genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))


class GraphLLMStream(llm.LLMStream):
    """Route fast → filler → graph thinks → synthesis speaks."""

    def __init__(
        self,
        llm_instance: GraphLLMAdapter,
        *,
        chat_ctx: ChatContext,
        tools: list[llm.Tool],
        conn_options: APIConnectOptions,
        graph: PregelProtocol,
        config: RunnableConfig | None = None,
    ):
        super().__init__(llm_instance, chat_ctx=chat_ctx, tools=tools, conn_options=conn_options)
        self._graph = graph
        self._config = config
        self._router_model = llm_instance._router_model
        self._genai_client = llm_instance._genai_client
        self._synthesis_model = llm_instance._synthesis_model

    async def _run(self) -> None:
        state = self._chat_ctx_to_state()
        t_start = time.time()

        # Get last user message for routing
        last_user_text = ""
        for msg in reversed(state["messages"]):
            if isinstance(msg, HumanMessage):
                last_user_text = msg.content
                break

        # Phase 1: Quick route classification (~300ms)
        t_route = time.time()
        from graph import classify_intent
        route = await asyncio.get_event_loop().run_in_executor(
            None, classify_intent, last_user_text, self._router_model
        )
        route_dur = int((time.time() - t_route) * 1000)
        log.info(f"[TIMING] route: {route_dur}ms → {route or 'greeting'}")

        # Phase 2: Emit filler immediately (no LLM, hardcoded)
        filler = FILLER_BY_ROUTE.get(route)
        if filler:
            log.info(f"[TIMING] filler emitted at {int((time.time() - t_start) * 1000)}ms: {filler}")
            self._event_ch.send_nowait(llm.ChatChunk(
                id=utils.shortuuid("FL_"),
                delta=llm.ChoiceDelta(role="assistant", content=filler),
            ))
            # FlushSentinel tells LiveKit: "this is complete, synthesize NOW"
            # Without it, TTS waits for more text and the filler is never spoken
            from livekit.agents.types import FlushSentinel
            self._event_ch.send_nowait(FlushSentinel())

        # Phase 3: Run full graph with pre-set route (skips router node)
        if route:
            state["route"] = route
        else:
            # Greeting — set voice_instructions directly, skip graph
            state["route"] = "greeting_direct"
            state["voice_instructions"] = "Respond to the customer's greeting warmly. Offer to help with their Jio Home broadband."

        t_graph = time.time()
        result = await self._graph.ainvoke(state, self._config)
        graph_dur = int((time.time() - t_graph) * 1000)

        voice_instructions = result.get("voice_instructions", "")
        voice_data = result.get("voice_data", {})
        log.info(f"[TIMING] graph: {graph_dur}ms, instructions={len(voice_instructions)} chars")

        if not voice_instructions:
            return  # filler was enough, or nothing to say

        # Phase 4: Stream synthesis (raw SDK, token-by-token)
        first_user = ""
        for msg in state["messages"]:
            if isinstance(msg, HumanMessage):
                first_user = msg.content
                break

        prompt = SYNTHESIS_PROMPT.format(
            last_user=last_user_text,
            instructions=voice_instructions[:1000],
        )
        if voice_data:
            prompt += f"\nKey data:\n{json.dumps(voice_data, indent=2)[:800]}\n"
        prompt += "\nSpeak this response:"

        t_synth = time.time()
        token_count = 0
        q: queue.Queue[str | None] = queue.Queue()

        def _produce():
            try:
                for chunk in self._genai_client.models.generate_content_stream(
                    model=self._synthesis_model,
                    contents=prompt,
                ):
                    text = chunk.text if hasattr(chunk, "text") else ""
                    if text:
                        q.put(text)
            finally:
                q.put(None)

        loop = asyncio.get_event_loop()
        producer = loop.run_in_executor(None, _produce)

        while True:
            try:
                text = q.get_nowait()
            except queue.Empty:
                await asyncio.sleep(0.01)
                continue

            if text is None:
                break

            token_count += 1
            if token_count == 1:
                ttft = int((time.time() - t_synth) * 1000)
                total = int((time.time() - t_start) * 1000)
                log.info(f"[TIMING] synthesis first token: {ttft}ms (total: {total}ms)")

            self._event_ch.send_nowait(llm.ChatChunk(
                id=utils.shortuuid("LG_"),
                delta=llm.ChoiceDelta(role="assistant", content=text),
            ))

        await producer
        total_dur = int((time.time() - t_start) * 1000)
        log.info(f"[TIMING] done: {total_dur}ms total, {token_count} synthesis tokens")

    def _chat_ctx_to_state(self) -> dict[str, Any]:
        messages = []
        for msg in self._chat_ctx.messages():
            content = msg.text_content
            if not content:
                continue
            if msg.role == "assistant":
                messages.append(AIMessage(content=content, id=msg.id))
            elif msg.role == "user":
                messages.append(HumanMessage(content=content, id=msg.id))
            elif msg.role in ("system", "developer"):
                messages.append(SystemMessage(content=content, id=msg.id))

        if not any(isinstance(m, HumanMessage) for m in messages):
            messages.append(HumanMessage(content="[new conversation started]"))

        return {
            "messages": messages,
            "route": "",
            "voice_instructions": "",
            "voice_data": {},
            "customer_language": "",
        }


class GraphLLMAdapter(llm.LLM):
    """Route fast → filler → graph → synthesis."""

    def __init__(
        self,
        graph: PregelProtocol,
        synthesis_model: str = "gemini-2.5-flash-lite",
        router_model=None,
        *,
        config: RunnableConfig | None = None,
    ):
        super().__init__()
        self._graph = graph
        self._config = config
        self._synthesis_model = synthesis_model
        self._genai_client = _create_genai_client()
        self._router_model = router_model

    @property
    def model(self) -> str:
        return "langgraph-voice"

    @property
    def provider(self) -> str:
        return "LangGraph"

    def chat(
        self,
        *,
        chat_ctx: ChatContext,
        tools: list[llm.Tool] | None = None,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
        parallel_tool_calls: NotGivenOr[bool] = NOT_GIVEN,
        tool_choice: NotGivenOr[ToolChoice] = NOT_GIVEN,
        extra_kwargs: NotGivenOr[dict[str, Any]] = NOT_GIVEN,
    ) -> GraphLLMStream:
        return GraphLLMStream(
            self,
            chat_ctx=chat_ctx,
            tools=tools or [],
            conn_options=conn_options,
            graph=self._graph,
            config=self._config,
        )
