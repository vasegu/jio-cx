"""LLM adapter: graph thinks, adapter speaks.

The graph (router → agent → tools → extract) runs via ainvoke() as a black box.
It returns voice_instructions + voice_data in state.
The adapter then streams the synthesis LLM directly to LiveKit's text channel —
true token-by-token streaming, no LangGraph batching in the way.
"""

from __future__ import annotations

import json
import logging
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

SYNTHESIS_PROMPT_TEMPLATE = (
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
    "Customer just said: {last_user}\n\n"
    "What to communicate:\n{instructions}\n"
)


class GraphLLMStream(llm.LLMStream):
    """Graph thinks (ainvoke), then synthesis streams directly to TTS."""

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
        self._synthesis_model = llm_instance._synthesis_model

    async def _run(self) -> None:
        state = self._chat_ctx_to_state()
        t_start = time.time()

        # Phase 1: Graph thinks (silent — no output to TTS)
        log.info("[TIMING] graph.ainvoke started")
        result = await self._graph.ainvoke(state, self._config)
        graph_dur = int((time.time() - t_start) * 1000)

        voice_instructions = result.get("voice_instructions", "")
        voice_data = result.get("voice_data", {})
        route = result.get("route", "")
        log.info(f"[TIMING] graph done: {graph_dur}ms, route={route}, instructions={len(voice_instructions)} chars")

        if not voice_instructions:
            self._event_ch.send_nowait(llm.ChatChunk(
                id=utils.shortuuid("LG_"),
                delta=llm.ChoiceDelta(role="assistant", content="How can I help you?"),
            ))
            return

        # Phase 2: Synthesis streams directly to TTS (true token-by-token)
        first_user, last_user = self._extract_user_messages(result.get("messages", []))

        prompt = SYNTHESIS_PROMPT_TEMPLATE.format(
            first_user=first_user,
            last_user=last_user,
            instructions=voice_instructions[:1000],
        )
        if voice_data:
            prompt += f"\nKey data to reference:\n{json.dumps(voice_data, indent=2)[:800]}\n"

        messages = [
            SystemMessage(content=prompt),
            HumanMessage(content="Speak this response."),
        ]

        t_synth = time.time()
        token_count = 0
        async for chunk in self._synthesis_model.astream(messages):
            token = chunk.content if hasattr(chunk, "content") else ""
            if token:
                token_count += 1
                if token_count == 1:
                    ttft = int((time.time() - t_synth) * 1000)
                    total_ttft = int((time.time() - t_start) * 1000)
                    log.info(f"[TIMING] synthesis first token: {ttft}ms (total TTFT: {total_ttft}ms)")
                self._event_ch.send_nowait(llm.ChatChunk(
                    id=utils.shortuuid("LG_"),
                    delta=llm.ChoiceDelta(role="assistant", content=token),
                ))

        synth_dur = int((time.time() - t_synth) * 1000)
        total_dur = int((time.time() - t_start) * 1000)
        log.info(f"[TIMING] synthesis done: {synth_dur}ms, {token_count} tokens, total: {total_dur}ms")

    def _extract_user_messages(self, messages):
        """Extract first and last user messages for language detection."""
        first_user = ""
        last_user = ""
        for msg in messages:
            if isinstance(msg, HumanMessage) and msg.content:
                if not first_user:
                    first_user = msg.content
                last_user = msg.content
        return first_user or "[new conversation]", last_user or "[no message]"

    def _chat_ctx_to_state(self) -> dict[str, Any]:
        """Convert LiveKit chat context to LangGraph state."""
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
    """Graph thinks, adapter speaks.

    Usage:
        adapter = GraphLLMAdapter(graph=compiled_graph, synthesis_model=llm)
        session = AgentSession(llm=adapter)
    """

    def __init__(
        self,
        graph: PregelProtocol,
        synthesis_model,
        *,
        config: RunnableConfig | None = None,
    ):
        super().__init__()
        self._graph = graph
        self._config = config
        self._synthesis_model = synthesis_model

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
