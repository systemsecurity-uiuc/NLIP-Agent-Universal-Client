# NLIP Agent Universal Client

Static browser client for sending ECMA-430-shaped NLIP messages to agent endpoints.

This repo is designed to be hosted with GitHub Pages.

## Local Use

Open `index.html` in a browser, or serve it locally:

```bash
python3 -m http.server 8090
```

Then open `http://localhost:8090`.

## GitHub Pages

1. Push this repo to GitHub.
2. Open the repository settings.
3. Go to **Pages**.
4. Select **Deploy from a branch**.
5. Choose the `main` branch and `/root`.
6. Save.

GitHub will publish the client at a URL like:

```text
https://systemsecurity-uiuc.github.io/NLIP-Agent-Universal-Client/
```

## Note About CORS

The target NLIP agent endpoint must allow browser requests from the GitHub Pages origin. If not, the request will work from command line tools such as `curl` but fail in the browser.
