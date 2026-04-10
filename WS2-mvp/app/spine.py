"""Jio Voice Agent Spine Server.

The spine sits between the phone UI and Gemini Live API.
It handles auth, tool execution, guardrails, and logging.
The phone only sends/receives audio. Everything else is server-side.

Usage:
    cd WS2-mvp/app
    python spine.py
    # Phone UI connects to ws://localhost:9090
    # HTTP serves phone app on http://localhost:9000

Architecture:
    Phone UI <--audio--> Spine <--audio+tools--> Gemini Live API
                           |
                           |--- RAG search (Vertex AI)
                           |--- Plan/customer/diagnostic tools
                           |--- Guardrails engine
                           |--- Decision logger
"""

import asyncio
import json
import logging
import os
import ssl
import sys
import time
import uuid
from pathlib import Path

import certifi
import google.auth
import websockets
from aiohttp import web
from google.auth.transport.requests import Request

from tools import get_function_declarations, execute_tool

# Benchmark logging
BENCHMARK_FILE = Path(__file__).parent / "spine_benchmark.jsonl"


class TurnTimer:
    """Tracks timestamps for a single conversational turn."""

    def __init__(self, session_id: str, turn: int):
        self.session_id = session_id
        self.turn = turn
        self.timestamps = {}

    def mark(self, event: str):
        self.timestamps[event] = time.time() * 1000  # ms

    def flush(self):
        """Calculate derived metrics and write to benchmark file."""
        ts = self.timestamps
        derived = {}

        if "first_audio_sent" in ts and "first_input_transcript" in ts:
            derived["stt_first_byte_ms"] = round(ts["first_input_transcript"] - ts["first_audio_sent"])
        if "first_audio_sent" in ts and "input_transcript_finished" in ts:
            derived["stt_total_ms"] = round(ts["input_transcript_finished"] - ts["first_audio_sent"])
        if "input_transcript_finished" in ts and "tool_call_received" in ts:
            derived["reasoning_to_tool_ms"] = round(ts["tool_call_received"] - ts["input_transcript_finished"])
        if "tool_call_received" in ts and "tool_result_sent" in ts:
            derived["tool_round_trip_ms"] = round(ts["tool_result_sent"] - ts["tool_call_received"])
        if "input_transcript_finished" in ts and "first_audio_response" in ts:
            derived["time_to_first_audio_ms"] = round(ts["first_audio_response"] - ts["input_transcript_finished"])
        if "first_audio_sent" in ts and "turn_complete" in ts:
            derived["total_turn_ms"] = round(ts["turn_complete"] - ts["first_audio_sent"])

        record = {
            "session_id": self.session_id,
            "turn": self.turn,
            "timestamps": {k: round(v) for k, v in ts.items()},
            "derived": derived,
        }
        with open(BENCHMARK_FILE, "a") as f:
            f.write(json.dumps(record) + "\n")
        log.info(f" BENCH turn {self.turn}: {json.dumps(derived)}")

# Logging - force unbuffered to stderr
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [SPINE] %(message)s',
    datefmt='%H:%M:%S',
    stream=sys.stderr,
    force=True,
)
log = logging.getLogger("spine")

# Config
PROJECT_ID = "jiobuddy-492811"
MODEL = "gemini-live-2.5-flash-native-audio"
MODEL_URI = f"projects/{PROJECT_ID}/locations/us-central1/publishers/google/models/{MODEL}"
GEMINI_WS_URL = "wss://us-central1-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent"

HTTP_PORT = 9000
WS_PORT = 9090

# System prompt - the agent's brain
SYSTEM_PROMPT = (Path(__file__).parent.parent / "agent" / "jio_home_assistant" / "prompts" / "system.md").read_text()


def get_access_token():
    """Get Google Cloud OAuth token from default credentials."""
    creds, _ = google.auth.default()
    if not creds.valid:
        creds.refresh(Request())
    return creds.token


def build_setup_message():
    """Build the Gemini Live API setup message with tools and config."""
    return {
        "setup": {
            "model": MODEL_URI,
            "generation_config": {
                "response_modalities": ["AUDIO"],
                "temperature": 0.7,
                "speech_config": {
                    "voice_config": {
                        "prebuilt_voice_config": {
                            "voice_name": "Kore",
                        }
                    }
                },
            },
            "system_instruction": {
                "parts": [{"text": SYSTEM_PROMPT}]
            },
            "tools": {
                "function_declarations": get_function_declarations()
            },
            "realtime_input_config": {
                "automatic_activity_detection": {
                    "disabled": False,
                    "silence_duration_ms": 2000,
                    "prefix_padding_ms": 500,
                },
            },
            "input_audio_transcription": {},
            "output_audio_transcription": {},
        }
    }


async def handle_phone_session(phone_ws):
    """Handle a single phone UI WebSocket connection.

    Creates a Gemini Live API connection and bridges audio between them.
    Tool calls are executed server-side.
    """
    session_id = str(uuid.uuid4())[:8]
    log.info(f" Phone connected (session={session_id})")

    # Get auth token
    token = get_access_token()
    if not token:
        await phone_ws.send(json.dumps({"type": "error", "message": "Auth failed"}))
        return

    # Connect to Gemini Live API
    ssl_ctx = ssl.create_default_context(cafile=certifi.where())
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }

    # Benchmark state for this session (lists for closure mutability)
    turn_counter = [0]
    turn_timer = [None]
    awaiting_new_turn = [True]  # shared flag: ready for next user utterance

    def new_turn():
        """Start timing a new conversational turn."""
        if turn_timer[0]:
            turn_timer[0].flush()
        turn_counter[0] += 1
        turn_timer[0] = TurnTimer(session_id, turn_counter[0])
        awaiting_new_turn[0] = False
        return turn_timer[0]

    try:
        async with websockets.connect(
            GEMINI_WS_URL, additional_headers=headers, ssl=ssl_ctx
        ) as gemini_ws:
            log.info(" Connected to Gemini Live API")

            # Send setup message
            setup = build_setup_message()
            await gemini_ws.send(json.dumps(setup))
            log.info(f" Setup sent ({len(get_function_declarations())} tools registered)")

            # Wait for setup complete
            setup_response = await gemini_ws.recv()
            setup_data = json.loads(setup_response)
            if setup_data.get("setupComplete"):
                log.info(" Gemini setup complete")
                await phone_ws.send(json.dumps({"type": "ready"}))
            else:
                log.info(f" Unexpected setup response: {setup_data}")

            # Bridge: phone <-> spine <-> gemini
            async def phone_to_gemini():
                """Forward audio from phone to Gemini."""
                try:
                    async for message in phone_ws:
                        data = json.loads(message)
                        msg_type = data.get("type")

                        if msg_type == "audio":
                            # Start a new turn on first audio chunk after previous turn ended
                            if awaiting_new_turn[0]:
                                timer = new_turn()
                                timer.mark("first_audio_sent")
                                log.info(f" Turn {turn_counter[0]} started (audio)")

                            # Forward audio chunk to Gemini
                            gemini_msg = {
                                "realtime_input": {
                                    "media_chunks": [{
                                        "mime_type": "audio/pcm",
                                        "data": data["data"],
                                    }]
                                }
                            }
                            try:
                                await gemini_ws.send(json.dumps(gemini_msg))
                            except Exception as e:
                                log.error(f" Gemini send failed on turn {turn_counter[0]}: {e}")
                                break

                        elif msg_type == "text":
                            # Text input starts a new turn too
                            timer = new_turn()
                            timer.mark("text_sent")

                            # Forward text message to Gemini
                            gemini_msg = {
                                "client_content": {
                                    "turns": [{
                                        "role": "user",
                                        "parts": [{"text": data["text"]}],
                                    }],
                                    "turn_complete": True,
                                }
                            }
                            await gemini_ws.send(json.dumps(gemini_msg))

                except websockets.exceptions.ConnectionClosed as e:
                    log.error(f" Phone WS CLOSED: code={e.code} reason={e.reason}")
                except Exception as e:
                    log.error(f"phone_to_gemini error: {e}", exc_info=True)
                # Log close state regardless of how loop ended
                log.info(f" phone_to_gemini loop ended cleanly (phone sent close frame)")

            async def gemini_to_phone():
                """Process Gemini responses: forward audio, execute tools."""
                first_audio_in_turn = [True]
                msg_count = [0]
                try:
                    async for message in gemini_ws:
                        msg_count[0] += 1
                        data = json.loads(message)
                        t = turn_timer[0]  # current turn timer

                        # Setup complete
                        if data.get("setupComplete"):
                            continue

                        # Turn complete
                        if data.get("serverContent", {}).get("turnComplete"):
                            if t:
                                t.mark("turn_complete")
                                t.flush()
                                turn_timer[0] = None
                            awaiting_new_turn[0] = True
                            first_audio_in_turn[0] = True
                            await phone_ws.send(json.dumps({"type": "turn_complete"}))
                            continue

                        # Interrupted
                        if data.get("serverContent", {}).get("interrupted"):
                            if t:
                                t.mark("interrupted")
                                t.flush()
                                turn_timer[0] = None
                            awaiting_new_turn[0] = True
                            first_audio_in_turn[0] = True
                            await phone_ws.send(json.dumps({"type": "interrupted"}))
                            continue

                        # Input transcription
                        input_tx = data.get("serverContent", {}).get("inputTranscription")
                        if input_tx:
                            if t:
                                if "first_input_transcript" not in t.timestamps:
                                    t.mark("first_input_transcript")
                                if input_tx.get("finished"):
                                    t.mark("input_transcript_finished")
                            await phone_ws.send(json.dumps({
                                "type": "input_transcript",
                                "text": input_tx.get("text", ""),
                                "finished": input_tx.get("finished", False),
                            }))
                            continue

                        # Output transcription
                        output_tx = data.get("serverContent", {}).get("outputTranscription")
                        if output_tx:
                            await phone_ws.send(json.dumps({
                                "type": "output_transcript",
                                "text": output_tx.get("text", ""),
                                "finished": output_tx.get("finished", False),
                            }))
                            continue

                        # Tool call - execute server-side
                        tool_call = data.get("toolCall")
                        if tool_call:
                            if t:
                                t.mark("tool_call_received")
                            tc_id = tool_call.get("id")
                            calls = tool_call.get("functionCalls", [])
                            for call in calls:
                                fn_name = call.get("name")
                                fn_args = call.get("args", {})
                                log.info(f" Tool call: {fn_name}({json.dumps(fn_args)[:80]})")

                                # Notify phone (for UI badges)
                                await phone_ws.send(json.dumps({
                                    "type": "tool_call",
                                    "tool": fn_name,
                                }))

                                # Execute tool server-side
                                result = await execute_tool(fn_name, fn_args)

                                # Send tool response back to Gemini
                                tool_response = {
                                    "tool_response": {
                                        "function_responses": [{
                                            "id": call.get("id", tc_id),
                                            "name": fn_name,
                                            "response": result,
                                        }]
                                    }
                                }
                                await gemini_ws.send(json.dumps(tool_response))
                                log.info(f" Tool response sent: {fn_name}")

                            if t:
                                t.mark("tool_result_sent")
                            continue

                        # Audio response - forward to phone
                        parts = data.get("serverContent", {}).get("modelTurn", {}).get("parts", [])
                        for part in parts:
                            if part.get("inlineData"):
                                if t and first_audio_in_turn[0]:
                                    t.mark("first_audio_response")
                                    first_audio_in_turn[0] = False
                                await phone_ws.send(json.dumps({
                                    "type": "audio",
                                    "data": part["inlineData"]["data"],
                                }))
                            elif part.get("text"):
                                await phone_ws.send(json.dumps({
                                    "type": "text",
                                    "text": part["text"],
                                }))

                except websockets.exceptions.ConnectionClosed as e:
                    log.error(f" Gemini WS CLOSED: code={e.code} reason={e.reason} (after {msg_count[0]} msgs)")
                except Exception as e:
                    log.error(f"gemini_to_phone error: {e}", exc_info=True)
                log.info(f" gemini_to_phone ended ({msg_count[0]} msgs processed)")

            # Run both directions concurrently
            phone_task = asyncio.create_task(phone_to_gemini())
            gemini_task = asyncio.create_task(gemini_to_phone())
            done, pending = await asyncio.wait(
                [phone_task, gemini_task],
                return_when=asyncio.FIRST_COMPLETED,
            )
            # Log which side dropped first
            for task in done:
                name = "phone_to_gemini" if task is phone_task else "gemini_to_phone"
                if task.exception():
                    log.error(f" {name} crashed: {task.exception()}")
                else:
                    log.info(f" {name} finished first")
            for task in pending:
                task.cancel()

    except Exception as e:
        log.info(f" Error: {e}")
        try:
            await phone_ws.send(json.dumps({"type": "error", "message": str(e)}))
        except:
            pass

    # Flush any incomplete turn timer
    if turn_timer[0]:
        turn_timer[0].flush()
    log.info(f" Session ended (session={session_id})")


# --- HTTP server for phone UI ---

async def serve_static(request):
    """Serve phone UI static files."""
    path = request.match_info.get("path", "index.html")
    path = path.lstrip("/")
    if ".." in path:
        return web.Response(text="Invalid path", status=400)
    if not path or path == "/":
        path = "index.html"

    # Serve from phone/dist (built React app) or phone/frontend
    for base in ["phone/dist", "static"]:
        file_path = Path(__file__).parent / base / path
        if file_path.exists() and file_path.is_file():
            import mimetypes
            content_type, _ = mimetypes.guess_type(str(file_path))
            with open(file_path, "rb") as f:
                return web.Response(body=f.read(), content_type=content_type or "application/octet-stream")

    return web.Response(text="Not found", status=404)


async def start_http_server():
    app = web.Application()
    app.router.add_get("/", serve_static)
    app.router.add_get("/{path:.*}", serve_static)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", HTTP_PORT)
    await site.start()
    log.info(f" HTTP server on http://localhost:{HTTP_PORT}")


async def start_ws_server():
    async with websockets.serve(
        handle_phone_session, "0.0.0.0", WS_PORT,
        ping_interval=None,   # disable server-side keepalive pings
        ping_timeout=None,
    ):
        log.info(f" WebSocket server on ws://localhost:{WS_PORT}")
        await asyncio.Future()


async def main():
    log.info(f"""
    Jio Voice Agent Spine
    ---------------------
    Phone UI:   http://localhost:{HTTP_PORT}
    WebSocket:  ws://localhost:{WS_PORT}
    Model:      {MODEL}
    Tools:      {len(get_function_declarations())}
    Project:    {PROJECT_ID}
    """)
    await asyncio.gather(start_http_server(), start_ws_server())


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log.info("Stopped")
