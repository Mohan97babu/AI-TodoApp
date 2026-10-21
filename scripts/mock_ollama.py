#!/usr/bin/env python3
"""Minimal Ollama/OpenAI API mock for CI; never use as real model inference."""
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ("/v1/models", "/api/tags"):
            self.reply(200, {"object": "list", "data": [{"id": "qwen3:1.7b", "object": "model"}]})
        else:
            self.reply(404, {"error": "not found"})

    def do_POST(self):
        if self.path != "/v1/chat/completions":
            self.reply(404, {"error": "not found"})
            return
        # Spring Boot's HttpURLConnection may use HTTP/1.1 chunked transfer
        # encoding instead of sending a Content-Length header.
        try:
            if "chunked" in self.headers.get("Transfer-Encoding", "").lower():
                body = bytearray()
                while True:
                    size_text = self.rfile.readline().strip().split(b";", 1)[0]
                    size = int(size_text, 16)
                    if size == 0:
                        # Consume optional HTTP trailers.
                        while self.rfile.readline().strip():
                            pass
                        break
                    if len(body) + size > 65536:
                        self.reply(413, {"error": "request too large"})
                        return
                    body.extend(self.rfile.read(size))
                    self.rfile.read(2)  # trailing CRLF
                payload = bytes(body)
            else:
                count = int(self.headers.get("Content-Length", "0"))
                if count > 65536:
                    self.reply(413, {"error": "request too large"})
                    return
                payload = self.rfile.read(count)
            obj = json.loads(payload)
        except (ValueError, UnicodeDecodeError, OSError):
            self.reply(400, {"error": "invalid json"})
            return
        if obj.get("model") != "qwen3:1.7b" or not obj.get("messages"):
            self.reply(400, {"error": "model or messages missing"})
            return
        self.reply(200, {
            "id": "ci-chat-test",
            "object": "chat.completion",
            "model": "qwen3:1.7b",
            "choices": [{"index": 0, "message": {"role": "assistant",
                         "content": "CI simulated Qwen response"}, "finish_reason": "stop"}],
        })

    def reply(self, status, body):
        encoded = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def log_message(self, format, *args):
        pass


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", 11434), Handler).serve_forever()
