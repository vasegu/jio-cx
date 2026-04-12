"""Jio Voice Agent — LiveKit + LangGraph spine.

Architecture:
    STT → Agent.llm_node() → TTS
              │
              ├── classify intent (Flash-Lite, ~300ms)
              ├── session.say() filler (separate speech segment)
              ├── graph.ainvoke() (agent + tools + extract)
              └── yield synthesis tokens (LangChain .stream())

The Agent.llm_node() override replaces the LLM adapter pattern.
It gives us session access for filler, native yield for streaming,
and LangSmith traces all LangChain calls automatically.

Usage:
    livekit-server --dev
    python agent_livekit.py start
"""

import asyncio
import json
import logging
import os
import sys
import time
from pathlib import Path
from typing import AsyncIterable

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import (
    AgentSession, Agent, AgentServer, ModelSettings,
    TurnHandlingOptions, llm, FunctionTool,
)
from livekit.plugins import silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

# Add agent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "agent"))

load_dotenv(Path(__file__).parent.parent / "agent" / ".env")
load_dotenv(Path(__file__).parent / ".env.local")

log = logging.getLogger("jio-livekit")

# Initialize tracing
from tracing import setup_tracing
setup_tracing()

SYSTEM_PROMPT = (
    Path(__file__).parent.parent / "agent" / "jio_home_assistant" / "prompts" / "system.md"
).read_text()

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

FILLER_PROMPT = (
    "Generate a 3-5 word acknowledgment. Examples: "
    "'Okay, checking that now.' 'Sure, one moment.' 'Got it, looking into it.' "
    "Do NOT answer the question. Do NOT include any facts, names, numbers or details. "
    "Just a brief acknowledgment. Match the customer's language."
)


# ---------------------------------------------------------------------------
# Provider factories
# ---------------------------------------------------------------------------

def get_stt():
    provider = os.getenv("STT_PROVIDER", "deepgram").lower()
    if provider == "sarvam":
        from livekit.plugins import sarvam
        return sarvam.STT(language="hi-IN", model="saaras:v3", mode="transcribe")
    elif provider == "deepgram":
        from livekit.plugins import deepgram
        return deepgram.STT(model="nova-3", language="multi")
    elif provider == "google":
        from livekit.plugins import google
        return google.STT()
    raise ValueError(f"Unknown STT_PROVIDER: {provider}")


def get_tts():
    provider = os.getenv("TTS_PROVIDER", "sarvam").lower()
    if provider == "sarvam":
        from livekit.plugins import sarvam
        return sarvam.TTS(target_language_code="hi-IN", model="bulbul:v3", speaker="shubh", pace=1.0)
    elif provider == "elevenlabs":
        from livekit.plugins import elevenlabs
        return elevenlabs.TTS()
    elif provider == "google":
        from livekit.plugins import google
        return google.TTS()
    raise ValueError(f"Unknown TTS_PROVIDER: {provider}")


# ---------------------------------------------------------------------------
# Agent with llm_node override
# ---------------------------------------------------------------------------

class JioHomeAssistant(Agent):
    """Jio voice agent. Overrides llm_node to use LangGraph + filler + synthesis."""

    def __init__(self, graph, router_model, synthesis_llm):
        super().__init__(
            instructions=SYSTEM_PROMPT,
            # LLM required for pipeline to call llm_node — we override the node itself
            llm="google/gemini-2.5-flash-lite",
        )
        self.graph = graph
        self.router_model = router_model
        self.synthesis_llm = synthesis_llm

    async def llm_node(
        self,
        chat_ctx: llm.ChatContext,
        tools: list[FunctionTool],
        model_settings: ModelSettings,
    ) -> AsyncIterable[str]:
        """yield filler → astream graph → yield synthesis."""
        import queue
        from graph import classify_intent
        t_start = time.time()

        state = self._build_state(chat_ctx)
        last_user = ""
        for msg in reversed(state["messages"]):
            if isinstance(msg, HumanMessage):
                last_user = msg.content
                break

        if not last_user:
            yield "How can I help you with your Jio Home broadband?"
            return

        # 1. Classify intent (Flash-Lite, ~300ms)
        from langsmith import traceable
        t_route = time.time()
        _classify = traceable(name="classify_intent")(classify_intent)
        route = await asyncio.get_event_loop().run_in_executor(
            None, _classify, last_user, self.router_model
        )
        route_dur = int((time.time() - t_route) * 1000)
        log.info(f"[TIMING] route: {route_dur}ms → {route or 'greeting'}")

        # 2. Generate + yield filler (if routing to sub-agent)
        ROUTE_LABELS = {
            "plan": "broadband plans",
            "troubleshoot": "connection diagnostics",
            "complaint": "their complaint",
        }
        filler_text = ""
        if route:
            t_filler = time.time()
            topic_label = ROUTE_LABELS.get(route, route)
            filler_response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.router_model.invoke(
                    [
                        SystemMessage(content=FILLER_PROMPT),
                        HumanMessage(content=f"Customer asking about: {topic_label}"),
                    ],
                    config={"run_name": "generate_filler"},
                )
            )
            filler_text = filler_response.content.strip()
            if not filler_text.endswith(('.', '!', '?')):
                filler_text += '.'
            filler_dur = int((time.time() - t_filler) * 1000)
            log.info(f"[TIMING] filler: {filler_dur}ms → {filler_text[:40]}")

            # Yield filler + FlushSentinel — TTS synthesizes filler as its own segment
            # FlushSentinel goes through text_ch (not _event_ch) so no metrics crash
            # See: https://github.com/livekit/agents/issues/1370
            from livekit.agents.types import FlushSentinel
            yield filler_text
            yield FlushSentinel()

        # 3. Stream graph (filler is playing during this)
        t_graph = time.time()
        if route:
            state["route"] = route
        else:
            # Greeting — set route so graph skips router node
            state["route"] = "greeting"
            state["voice_instructions"] = "Respond to the customer's greeting warmly. Offer to help with their Jio Home broadband."

        # LangSmith thread grouping
        session_id = str(id(self.session))
        config = {"metadata": {"session_id": session_id, "thread_id": session_id}}

        # Start with voice_instructions from state (greeting case sets it before graph)
        final_vi = state.get("voice_instructions", "")
        final_vd = {}
        async for node_output in self.graph.astream(state, config, stream_mode="updates"):
            for node_name, update in node_output.items():
                vi = update.get("voice_instructions", "")
                vd = update.get("voice_data")
                if vi:
                    final_vi = vi
                if vd is not None:
                    final_vd = vd

        graph_dur = int((time.time() - t_graph) * 1000)
        log.info(f"[TIMING] graph: {graph_dur}ms, instructions={len(final_vi)} chars")

        if not final_vi:
            yield "I'm not sure how to help with that. Could you tell me more?"
            return

        # 4. Stream synthesis via queue bridge (sync .stream() → async yield)
        prompt = SYNTHESIS_PROMPT.format(
            last_user=last_user,
            instructions=final_vi[:1000],
        )
        if final_vd:
            prompt += f"\nKey data:\n{json.dumps(final_vd, indent=2)[:800]}\n"

        messages = [
            SystemMessage(content=prompt),
            HumanMessage(content="Speak this response."),
        ]

        t_synth = time.time()
        token_count = 0
        q: queue.Queue[str | None] = queue.Queue()

        @traceable(name="voice_synthesis")
        def _produce():
            try:
                for chunk in self.synthesis_llm.stream(messages):
                    text = chunk.content if hasattr(chunk, "content") else ""
                    if text:
                        q.put(text)
            finally:
                q.put(None)

        producer = asyncio.get_event_loop().run_in_executor(None, _produce)

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
                synth_ttft = int((time.time() - t_synth) * 1000)
                total = int((time.time() - t_start) * 1000)
                log.info(f"[TIMING] synthesis first token: {synth_ttft}ms (total: {total}ms)")
            yield text

        await producer
        total_dur = int((time.time() - t_start) * 1000)
        log.info(f"[TIMING] done: {total_dur}ms, {token_count} synthesis tokens")

    def _build_state(self, chat_ctx: llm.ChatContext) -> dict:
        """Convert LiveKit ChatContext to LangGraph state dict."""
        messages = []
        for msg in chat_ctx.messages():
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


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

server = AgentServer()


@server.rtc_session()
async def entrypoint(ctx: agents.JobContext):
    from graph import build_graph, _get_llm

    graph = build_graph(
        router_llm=os.getenv("ROUTER_LLM", "google"),
        agent_llm=os.getenv("AGENT_LLM", "google"),
    )
    router_model = _get_llm("google", model="gemini-2.5-flash-lite")
    synthesis_llm = _get_llm("google", model="gemini-2.5-flash-lite")

    agent = JioHomeAssistant(graph, router_model, synthesis_llm)

    stt_name = os.getenv("STT_PROVIDER", "google")
    tts_name = os.getenv("TTS_PROVIDER", "google")
    log.info(f"Pipeline: STT={stt_name} TTS={tts_name} LLM=llm_node(LangGraph+synthesis)")

    session = AgentSession(
        stt=get_stt(),
        tts=get_tts(),
        vad=silero.VAD.load(),
        turn_handling=TurnHandlingOptions(
            turn_detection=MultilingualModel(),
            interruption={"mode": "adaptive"},
        ),
    )

    await session.start(room=ctx.room, agent=agent)


if __name__ == "__main__":
    agents.cli.run_app(server)
