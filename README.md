# NLIP Agent Universal Client

Static browser client for sending ECMA-430-shaped NLIP messages to agent endpoints.

This repo is designed to be hosted with GitHub Pages.

## Local Use

Open `index.html` in a browser, or serve it locally:

```bash
python3 -m http.server 8090
```

Then open `http://localhost:8090`.

For a demo of the running Jetstream knowledge agent without a public endpoint,
open a Mac terminal and keep this SSH tunnel running:

```bash
ssh -N -L 8091:127.0.0.1:8091 exouser@149.165.174.189
```

In a second Mac terminal, run `python3 demo_server.py` from this repository and
open `http://127.0.0.1:8090`. The knowledge-agent preset will use the local
same-origin `/nlip` route. The demo server serves the page and forwards API calls
through the SSH tunnel; it binds only to the Mac's loopback interface. It does
not expose the agent publicly. Keep both terminals running while recording.

The knowledge-agent preset points to the deployed HTTPS service at
`https://nlip-knowledge-jetstream.tail1f5426.ts.net/nlip`. The builder preset is
blank until a separate builder endpoint is deployed. You can enter and save a
different HTTPS endpoint in the browser; old temporary tunnel URLs are ignored.

Use **Check status** before sending a demo request. It calls the selected endpoint's `/health` route and displays whether the service is reachable.

## GitHub Pages

1. Push this repo to GitHub.
2. Open the repository settings.
3. Go to **Pages**.
4. Select **Deploy from a branch**.
5. Choose the `main` branch and `/root`.
6. Save.

The client is published at:

```text
https://systemsecurity-uiuc.github.io/NLIP-Agent-Universal-Client/
```

## Note About CORS

The target NLIP agent endpoint must allow browser requests from the GitHub Pages origin. If not, the request will work from command line tools such as `curl` but fail in the browser.
