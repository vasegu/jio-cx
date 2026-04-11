"""LLM adapter: runs LangGraph as a black box, returns only the final response.

The graph handles all internal reasoning (routing, tool calls, sub-agents)
via ainvoke(). Only the compute_output node produces an AIMessage.
We extract that and send it to TTS in sentence chunks.
"""

from __future__ import annotations

import logging
import re
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


class GraphLLMStream(llm.LLMStream):
    """Runs the graph to completion, then sends the final response to TTS."""

    def __init__(
        self,
        llm_instance: llm.LLM,
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

    async def _run(self) -> None:
        state = self._chat_ctx_to_state()

        # Stream with custom mode — only compute_output emits tokens via writer()
        # Router, agent reasoning, tool calls are all silent (no writer calls)
        async for token in self._graph.astream(
            state,
            self._config,
            stream_mode="custom",
        ):
            # token is whatever compute_output's writer() emitted — a string
            if isinstance(token, str) and token:
                self._event_ch.send_nowait(llm.ChatChunk(
                    id=utils.shortuuid("LG_"),
                    delta=llm.ChoiceDelta(role="assistant", content=token),
                ))

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

        # Vertex AI requires at least one user message
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
    """Wraps a LangGraph compiled graph as a LiveKit LLM.

    The graph runs as a black box via ainvoke(). Only the final
    synthesized response (from compute_output) reaches TTS.
    """

    def __init__(self, graph: PregelProtocol, *, config: RunnableConfig | None = None):
        super().__init__()
        self._graph = graph
        self._config = config

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
