"""Serve the browser client and proxy its NLIP calls to a local SSH tunnel.

Run on the Mac after forwarding Jetstream's 127.0.0.1:8091 to local port 8091.
This server binds only to loopback and does not publish an Internet endpoint.
"""

import argparse
from http.client import HTTPConnection
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


API_PATHS = {"/health", "/model-health", "/nlip", "/security/status", "/security/audit"}
MAX_REQUEST_BYTES = 128 * 1024


class DemoHandler(SimpleHTTPRequestHandler):
    upstream_port = 8091

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).resolve().parent), **kwargs)

    def do_GET(self):
        if urlsplit(self.path).path in API_PATHS:
            self.proxy_request()
        else:
            super().do_GET()

    def do_POST(self):
        if urlsplit(self.path).path != "/nlip":
            self.send_error(404)
            return
        self.proxy_request()

    def proxy_request(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_error(400, "Invalid Content-Length")
            return
        if length < 0 or length > MAX_REQUEST_BYTES:
            self.send_error(413, "NLIP request is too large")
            return

        body = self.rfile.read(length) if self.command == "POST" else None
        headers = {}
        if body is not None:
            headers["Content-Type"] = self.headers.get("Content-Type", "application/json")
        if urlsplit(self.path).path == "/security/audit" and self.headers.get("Authorization"):
            headers["Authorization"] = self.headers["Authorization"]

        try:
            upstream = HTTPConnection("127.0.0.1", self.upstream_port, timeout=70)
            upstream.request(self.command, self.path, body=body, headers=headers)
            response = upstream.getresponse()
            payload = response.read()
            self.send_response(response.status)
            self.send_header("Content-Type", response.getheader("Content-Type", "application/json"))
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            upstream.close()
        except OSError:
            payload = b'{"status":"error","message":"Jetstream SSH tunnel is unavailable"}'
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8090, help="Local browser port")
    parser.add_argument("--upstream-port", type=int, default=8091, help="Local SSH-forwarded port")
    args = parser.parse_args()
    DemoHandler.upstream_port = args.upstream_port
    server = ThreadingHTTPServer(("127.0.0.1", args.port), DemoHandler)
    print(f"NLIP demo: http://127.0.0.1:{args.port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
