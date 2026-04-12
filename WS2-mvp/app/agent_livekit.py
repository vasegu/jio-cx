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
    "{filler_context}"
    "Customer said: {last_user}\n\n"
    "What to communicate:\n{instructions}\n"
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

    def __init__(self, graph, synthesis_llm):
        super().__init__(
            instructions=SYSTEM_PROMPT,
            llm="google/gemini-2.5-flash-lite",
        )
        self.graph = graph
        self.synthesis_llm = synthesis_llm

    async def llm_node(
        self,
        chat_ctx: llm.ChatContext,
        tools: list[FunctionTool],
        model_settings: ModelSettings,
    ) -> AsyncIterable[str]:
        """Stream graph → yield filler on router update → yield synthesis on extract update.

        All routing + filler happens inside the graph's router node.
        This method just reacts to voice_instructions from each node update.
        """
        from livekit.agents.types import FlushSentinel
        from langsmith import traceable
        t_start = time.time()

        # Thread/turn IDs for LangSmith
        room_id = self.session.room.name if self.session and self.session.room else "unknown"
        thread_meta = {"thread_id": room_id}
        turn_id = f"{room_id}-{int(t_start)}"

        state = self._build_state(chat_ctx)
        last_user = ""
        for msg in reversed(state["messages"]):
            if isinstance(msg, HumanMessage):
                last_user = msg.content
                break

        if not last_user:
            yield "How can I help you with your Jio Home broadband?"
            return

        # Stream the graph — routing + filler happen inside the graph's router node
        config = {"metadata": {**thread_meta, "turn_id": turn_id}}

        filler_text = ""
        final_vi = ""
        final_vd = {}

        async for node_output in self.graph.astream(state, config, stream_mode="updates"):
            for node_name, update in node_output.items():
                vi = update.get("voice_instructions", "")
                vd = update.get("voice_data")

                if vi and vi != final_vi:
                    if not filler_text and node_name == "router":
                        # First voice_instructions from router = filler
                        filler_text = vi
                        elapsed = int((time.time() - t_start) * 1000)
                        log.info(f"[TIMING] filler from router at {elapsed}ms: {vi[:40]}")
                        yield filler_text
                        yield FlushSentinel()

                    final_vi = vi

                if vd is not None:
                    final_vd = vd

        graph_dur = int((time.time() - t_start) * 1000)
        log.info(f"[TIMING] graph done: {graph_dur}ms, instructions={len(final_vi)} chars")

        # Synthesise the final voice_instructions (from extract node)
        if not final_vi:
            yield "I'm not sure how to help with that. Could you tell me more?"
            return

        filler_context = ""
        if filler_text and final_vi != filler_text:
            filler_context = (
                f"You already said: \"{filler_text}\" — continue naturally from that. "
                "Don't repeat the acknowledgment. Go straight to the answer.\n\n"
            )

        prompt = SYNTHESIS_PROMPT.format(
            last_user=last_user,
            instructions=final_vi[:1000],
            filler_context=filler_context,
        )
        if final_vd:
            prompt += f"\nKey data:\n{json.dumps(final_vd, indent=2)[:800]}\n"

        messages = [
            SystemMessage(content=prompt),
            HumanMessage(content="Speak this response."),
        ]

        # Stream synthesis via asyncio.Queue (clean async, no busy-wait)
        t_synth = time.time()
        token_count = 0
        q: asyncio.Queue[str | None] = asyncio.Queue()

        async def _produce():
            @traceable(name="voice_synthesis", metadata=thread_meta)
            def _stream():
                results = []
                try:
                    for chunk in self.synthesis_llm.stream(messages):
                        text = chunk.content if hasattr(chunk, "content") else ""
                        if text:
                            results.append(text)
                except Exception as e:
                    log.error(f"Synthesis error: {e}")
                return results

            # Run sync stream in thread, then put results in async queue
            texts = await asyncio.get_event_loop().run_in_executor(None, _stream)
            for text in texts:
                await q.put(text)
            await q.put(None)

        producer = asyncio.create_task(_produce())

        while True:
            text = await q.get()
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

server = AgentServer(num_idle_processes=1)


def prewarm(proc: agents.JobProcess):
    """Pre-load models and warm caches before any jobs arrive."""
    from graph import build_graph, _get_llm

    log.info("[PREWARM] Loading graph + models...")

    proc.userdata["graph"] = build_graph(
        router_llm=os.getenv("ROUTER_LLM", "google"),
        agent_llm=os.getenv("AGENT_LLM", "google"),
    )
    proc.userdata["synthesis_llm"] = _get_llm("google", model="gemini-2.5-flash-lite")
    proc.userdata["vad"] = silero.VAD.load()

    log.info("[PREWARM] Done (graph + models loaded)")


server.setup_fnc = prewarm


@server.rtc_session()
async def entrypoint(ctx: agents.JobContext):
    # Use pre-loaded models from prewarm
    graph = ctx.proc.userdata["graph"]
    synthesis_llm = ctx.proc.userdata["synthesis_llm"]
    vad = ctx.proc.userdata["vad"]

    agent = JioHomeAssistant(graph, synthesis_llm)

    stt_name = os.getenv("STT_PROVIDER", "google")
    tts_name = os.getenv("TTS_PROVIDER", "google")
    log.info(f"Pipeline: STT={stt_name} TTS={tts_name} LLM=llm_node(LangGraph+synthesis)")

    session = AgentSession(
        stt=get_stt(),
        tts=get_tts(),
        vad=vad,
        turn_handling=TurnHandlingOptions(
            turn_detection=MultilingualModel(),
            interruption={"mode": "adaptive"},
        ),
    )

    await session.start(room=ctx.room, agent=agent)


if __name__ == "__main__":
    agents.cli.run_app(server)
