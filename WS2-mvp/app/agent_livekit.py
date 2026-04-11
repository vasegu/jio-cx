"""Jio Voice Agent — LiveKit + LangGraph spine.

Replaces spine.py (Gemini Live monolith) with a modular pipeline:
    STT (swappable) → LLM via LangGraph (swappable) → TTS (swappable)

Each component is configured via environment variables so you can
benchmark different providers without changing code.

Usage:
    # Start LiveKit server (dev mode)
    livekit-server --dev

    # Run the agent
    cd WS2-mvp/app
    python agent_livekit.py dev

Env vars:
    LIVEKIT_URL          (default: ws://localhost:7880)
    LIVEKIT_API_KEY      (default: devkey)
    LIVEKIT_API_SECRET   (default: secret)
    STT_PROVIDER         sarvam | deepgram | google  (default: deepgram)
    TTS_PROVIDER         sarvam | elevenlabs | google (default: sarvam)
    LLM_PROVIDER         google | groq | openai       (default: google)
    SARVAM_API_KEY       (required if using sarvam)
    DEEPGRAM_API_KEY     (required if using deepgram)
    GOOGLE_API_KEY       (required if using google)
    GROQ_API_KEY         (required if using groq)
    OPENAI_API_KEY       (required if using openai)
"""

import os
import sys
import logging
from pathlib import Path

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentSession, Agent, AgentServer
from livekit.plugins import silero

load_dotenv(Path(__file__).parent.parent / "agent" / ".env")
load_dotenv(Path(__file__).parent / ".env.local")

log = logging.getLogger("jio-livekit")

# Initialize tracing before anything else
from tracing import setup_tracing
setup_tracing()

# System prompt — same one used by the Gemini Live spine
SYSTEM_PROMPT = (
    Path(__file__).parent.parent / "agent" / "jio_home_assistant" / "prompts" / "system.md"
).read_text()


# ---------------------------------------------------------------------------
# Provider factories — swap by changing one env var
# ---------------------------------------------------------------------------

def get_stt():
    """Return configured STT plugin based on STT_PROVIDER env var."""
    provider = os.getenv("STT_PROVIDER", "deepgram").lower()

    if provider == "sarvam":
        from livekit.plugins import sarvam
        return sarvam.STT(
            language="hi-IN",
            model="saaras:v3",
            mode="transcribe",
        )
    elif provider == "deepgram":
        from livekit.plugins import deepgram
        return deepgram.STT(model="nova-3", language="multi")
    elif provider == "google":
        from livekit.plugins import google
        return google.STT()
    else:
        raise ValueError(f"Unknown STT_PROVIDER: {provider}")


def get_tts():
    """Return configured TTS plugin based on TTS_PROVIDER env var."""
    provider = os.getenv("TTS_PROVIDER", "sarvam").lower()

    if provider == "sarvam":
        from livekit.plugins import sarvam
        return sarvam.TTS(
            target_language_code="hi-IN",
            model="bulbul:v3",
            speaker="shubh",
            pace=1.0,
        )
    elif provider == "elevenlabs":
        from livekit.plugins import elevenlabs
        return elevenlabs.TTS()
    elif provider == "google":
        from livekit.plugins import google
        return google.TTS(timeout=30)
    else:
        raise ValueError(f"Unknown TTS_PROVIDER: {provider}")


def get_llm():
    """Return configured LLM based on LLM_PROVIDER env var.

    'langgraph' — full agent graph with routing + tools (production)
    'google'/'groq'/'openai' — direct LLM for testing voice pipeline only
    """
    provider = os.getenv("LLM_PROVIDER", "langgraph").lower()

    if provider == "langgraph":
        from llm_adapter import GraphLLMAdapter
        sys.path.insert(0, str(Path(__file__).parent.parent / "agent"))
        from graph import build_graph
        graph = build_graph(
            router_llm=os.getenv("ROUTER_LLM", "google"),
            agent_llm=os.getenv("AGENT_LLM", "google"),
        )
        synthesis_model = os.getenv("SYNTHESIS_MODEL", "gemini-2.5-flash-lite")
        log.info(f"LLM: LangGraph brain + raw SDK synthesis ({synthesis_model})")
        return GraphLLMAdapter(graph=graph, synthesis_model=synthesis_model)
    elif provider == "google":
        from livekit.plugins import google
        return google.LLM(model="gemini-2.5-flash")
    elif provider == "groq":
        from livekit.plugins import openai
        return openai.LLM.with_groq(model="llama-3.3-70b-versatile")
    elif provider == "openai":
        from livekit.plugins import openai
        return openai.LLM(model="gpt-4o-mini")
    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {provider}")


# ---------------------------------------------------------------------------
# Agent definition
# ---------------------------------------------------------------------------

class JioHomeAssistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

server = AgentServer()


@server.rtc_session()  # no agent_name = auto-dispatch to every new room
async def entrypoint(ctx: agents.JobContext):
    stt = get_stt()
    tts = get_tts()
    llm = get_llm()

    stt_name = os.getenv("STT_PROVIDER", "deepgram")
    tts_name = os.getenv("TTS_PROVIDER", "sarvam")
    llm_name = os.getenv("LLM_PROVIDER", "google")
    log.info(f"Pipeline: STT={stt_name} LLM={llm_name} TTS={tts_name}")

    session = AgentSession(
        stt=stt,
        llm=llm,
        tts=tts,
        vad=silero.VAD.load(),
    )

    await session.start(
        room=ctx.room,
        agent=JioHomeAssistant(),
    )

    # No auto-greeting — wait for the customer to speak first


if __name__ == "__main__":
    agents.cli.run_app(server)
