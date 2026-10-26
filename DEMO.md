# Knowledge-agent security demo

This walkthrough records the browser client calling the secured knowledge agent
running on Jetstream. It uses an SSH tunnel and the local demo server; it does
not require a public endpoint or change the Jetstream deployment.

## Before recording (Mac)

In Terminal 1, keep the SSH tunnel running:

```bash
ssh -N -L 8091:127.0.0.1:8091 exouser@149.165.174.189
```

In Terminal 2, from this repository, run:

```bash
python3 demo_server.py
```

Open `http://127.0.0.1:8090`. The knowledge preset should show
`http://127.0.0.1:8090/nlip`. Both terminals must remain open.

If the browser reports `Jetstream SSH tunnel is unavailable`, check Terminal 1.
If port 8091 is already used on the Mac, choose another local port in both the
SSH `-L` option and `demo_server.py --upstream-port`.

## Recording sequence

1. **Check status.** Show the agent name, model, and loaded knowledge-chunk
   count. A successful `/health` alone does not prove the model works.
2. **Check model.** Confirm `/model-health` reports `status: ok`.
3. **Knowledge request.** Select **Knowledge template**, send it, and point out
   the NLIP envelope, `generation_mode: model`, answer, and source list. If the
   model is unavailable, stop and retry later instead of presenting fallback as
   a model answer.
4. **Legitimate security question.** Select **Security template** and show that
   an ordinary ECMA-434 question is allowed.
5. **Attack.** Select **Prompt-injection test** and show
   `allowed: false`, `security_decision: block`, and `direction: inbound`.
6. **Protocol validation.** Select **Invalid-format test** and show the guard's
   schema-violation reason.
7. **Security status.** Show the configured checks and explain that they are
   local policy controls, not a claim of complete ECMA-434 compliance.

To demonstrate SDK pluggability, the test command below runs the real SDK
client/server integration tests locally from `NLIP-knowledge-agent`. It requires
the framework checkout on `PYTHONPATH`:

```bash
PYTHONPATH=/tmp/nlip-security-framework .venv/bin/python -m unittest discover -s tests -q
```

The audit route requires an administrator token. Avoid showing the token in the
recording. The browser's audit button uses a plain prompt and should be skipped
unless token entry is hidden while recording.

## Claims to keep accurate

- The guard checks NLIP messages at ingress and egress; the optional adapter
  registers it at NLIP SDK communication boundaries.
- The browser demo uses the standalone FastAPI service. The SDK tests show a
  separate in-process SDK HTTP exchange with a deterministic handler.
- The guard detects selected direct attacks and secret signatures. It does not
  guarantee protection against all prompt injection or information leakage.
- The SSH tunnel is a demo connection, not a permanent public endpoint.
