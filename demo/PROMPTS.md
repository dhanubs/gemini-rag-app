# Paste-ready demo prompts

Paste these instead of typing them live. Keep this file open in a side tab.

---

## Act 1 — Completions & Next Edit Suggestions
In `app/main.py`, type only this and let the ghost text finish it:
```python
@app.get("/version")
def version() -> dict[str, str]:
    """Return the application name and version."""
```
**NES moment:** in `app/config.py`, rename `data_dir` → `storage_dir`, then press Tab through the
suggested follow-up edits in other files.

---

## Act 2 — Context engineering
**Before** (temporarily rename `.github/copilot-instructions.md` to `.bak`), Ask mode:
> How should I add a Gemini call to this project?

**After** (restore the file), ask the same question again. Point out: the right SDK, the
adapter layer, model name from config, a test fake.

Context variables:
> Using #file:app/config.py and #codebase, what's missing for a production-ready RAG service?

> #fetch https://ai.google.dev/gemini-api/docs/embeddings — summarise the embedding API options relevant to us.

---

## Act 3 — Agent mode builds the feature
**Step 1, plan** — switch to the **planner** agent (or Plan mode):
> Plan the implementation of document ingestion and question answering with citations,
> per demo/issues/01-document-ingestion.md and demo/issues/02-ask-with-citations.md.

Edit the plan visibly (e.g. "use a NumPy-based store, no Chroma"), then hand off.

**Step 2, build** — Agent mode:
> Implement the plan. Write the tests first, then the code. Use a fake Gemini adapter in tests.
> Run ruff and pytest and keep going until both pass.

**Step 3, reusable workflow:**
> /new-endpoint endpoint=GET /documents/{id}/chunks purpose=return the chunks stored for a document

> `demo/checkpoint.sh save act-3`

---

## Act 4 — MCP
> Using the GitHub MCP server, list the open issues in this repo that relate to ingestion
> and summarise what's left to do.

(optional, once there's a UI) > Use Playwright to open http://localhost:8000/docs and check
that the /ask endpoint is listed.

---

## Act 5 — Copilot coding agent
- On GitHub, open the "List and delete documents" issue → **Assign to Copilot**.
- Switch to the PR started before the demo (logging issue) → show the session log, commits, CI.
- Comment on that PR:
> @copilot Please also add a `request_id` (UUID) to each log line and return it in an
> `X-Request-ID` response header.

---

## Act 6 — Quality gates
- Open the PR from `demo/vulnerable-upload` → request a **Copilot review**.
- Show the CodeQL path-injection alert → **Generate fix** (Copilot Autofix).
- In the editor: `/security-review` on `app/api/raw_files.py`.

---

## Back-pocket "wow"s (if something falls flat)
> Introduce a subtle off-by-one in the chunk overlap, run the tests, and then fix whatever fails.
(Shows the agent's self-correction loop.)

> Draw a Mermaid sequence diagram of the /ask request flow from the code as it is now.
