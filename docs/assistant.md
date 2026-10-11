# Local Ollama assistant — iteration 1

The site has an Ask Aegis chat dialog backed by `POST /api/v1/assistant/chat`.
The configured default is `smollm2:135m`. FastAPI retrieves published products and help
articles directly from Neon, ranks matching keywords, and supplies a small context to Ollama.
This is keyword retrieval, not vector search or fine-tuning. No embeddings are required.

## Run

Keep the Ollama desktop app running. `ollama list` should include `smollm2:135m`.
If needed, run `ollama pull smollm2:135m` once. Start the API and frontend using the existing
`scripts/dev-api.ps1` and `scripts/dev-web.ps1` commands in separate terminals.
Open http://127.0.0.1:5173 and choose Ask Aegis in the bottom corner.

Optional project-root `.env` settings (defaults shown):

```dotenv
PORTAL_OLLAMA_BASE_URL=http://127.0.0.1:11434
PORTAL_OLLAMA_MODEL=smollm2:135m
PORTAL_OLLAMA_TIMEOUT_SECONDS=90
```

Install a replacement model with Ollama, change the model setting, and restart FastAPI.
No frontend changes are needed. Ollama must be reachable from the backend's machine;
a hosted Render backend cannot reach a laptop through `127.0.0.1`.

## Data and controls

- Backend query filters include `published = true`. Only public data enters the context.
- Exact product-name matches take priority. Non-comparison questions send the top source
  to the model; source cards can show up to three retrieval matches.
- Prices and sample stock in source cards come from the database, independent of model output.
- No-match requests return a clearly non-generated answer without invoking the model.
- Models cannot execute SQL, choose tools, make purchases or mutate data.
- Inputs allow 600 characters and four prior user/assistant turns. System roles, arbitrary
  model names and unexpected fields are rejected. Context/history and output are bounded.
- One generation runs per backend process, with ten requests per client IP per minute.
  Limits are in memory: they reset on restart and are not distributed. This local setup
  needs a shared limiter, proxy configuration and request-body limits before public hosting.
- Ollama errors become user-facing offline, timeout or invalid-response messages. Provider
  details and credentials are not returned. Browser errors retain the question for retry.
- Plain-text rendering escapes model output; source URLs are created by the backend.
- Conversations remain in browser memory. Reload/new conversation clears them. The database
  and application logs do not store chat text; logs contain request ID, model, timing and counts.

## Evaluation and limitations

The backend suite passed 44 tests during integration, including 16 new assistant cases.
Those cases cover input/role validation, source values, no-match handling, rate/concurrency
limits, provider failure mapping, public query filters and exact-name retrieval.
Live Ollama calls and database retrieval were also exercised.
The assistant tests were rerun after the final retrieval and prompt adjustments.
Frontend build and lint passed. The live browser flow was manually checked, including
generation, source cards and resetting the conversation. Automated desktop/mobile UI
tests were added, but Edge could not launch in the execution sandbox (named-pipe error),
so those UI assertions have not been verified by the automated runner.

SmolLM2 135M is an initial integration baseline. Live tests showed repetition, fact mixing
with multiple records, and weak instruction following. Narrower prompts and repetition control
reduce these problems but do not guarantee accurate answers. Source cards are supplied context,
not proof that every generated sentence is supported. Verify answers against the linked records.
No claim is made that prompts alone prevent injection or hidden-context disclosure.

This iteration does not introduce private customer data, controlled vulnerabilities, persistent
conversations, vector retrieval, streaming, or an LLM scanner. Evaluate larger models with the
same question set before treating this assistant as a reliable production support feature.
