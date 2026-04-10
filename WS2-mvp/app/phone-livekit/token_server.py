"""Tiny token server for LiveKit dev testing.

Run: python token_server.py
Serves: http://localhost:8089/token → {"token": "..."}
Also serves the test UI on http://localhost:8089/
"""

import json
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

from livekit.api import AccessToken, VideoGrants

API_KEY = "devkey"
API_SECRET = "secret"
ROOM = "jio-test"
PORT = 8089


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).parent), **kwargs)

    def do_GET(self):
        if self.path == "/token":
            token = (
                AccessToken(API_KEY, API_SECRET)
                .with_identity(f"user-{int(time.time())}")
                .with_grants(VideoGrants(room_join=True, room=ROOM))
                .to_jwt()
            )
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"token": token}).encode())
        else:
            super().do_GET()


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Token server + UI on http://localhost:{PORT}")
    print(f"Room: {ROOM}")
    server.serve_forever()
