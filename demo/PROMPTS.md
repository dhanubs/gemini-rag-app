# Paste-ready prompts (18-minute VS Code demo)

Keep this file open in a side tab. Paste; don't type.

**Where things go:** quoted `>` text is pasted into the **Copilot Chat input box**.
`/name` commands are the prompt files in `.github/prompts/` (type `/` in chat to see them).
The **planner** and **Agent** choices are in the mode/agent dropdown at the bottom of the chat box.

| You'll see after typing `/` | Used in |
|---|---|
| `/build-from-issue` | §3 build (live) and the rehearsal build |
| `/security-review` | §5 |
| `/new-endpoint`, `/write-tests` | back-pocket extras |

---

## §1 · Completions + Next Edit Suggestions (2 min)
In the VS Code **Explorer**, right-click the `app/services` folder → **New File** →
`chunking.py`. In the empty file type only the two lines below (press Enter after the docstring),
then wait for the grey ghost text and press **Tab** to accept it:
```python
def chunk_text(text: str, size: int = 800, overlap: int = 100) -> list[str]:
    """Split text into overlapping chunks of roughly `size` characters."""
```
**NES moment:** rename the parameter `size` → `chunk_size` in the signature, then press **Tab**
to accept each suggested follow-up edit in the body.

(Leave the file — the agent in §3 can reuse it for ingestion. `checkpoint.py restore` clears it
for the next rehearsal.)

---

## §2 · Context engineering (3 min)
**Before:** Settings → search *"instruction files"* → untick
*"Chat › Code Generation: Use Instruction Files"* (also untick the AGENTS.md option if present).
In **Ask** mode:
> How should I add a Gemini call to this project? Show me the code.

**After:** tick the setting(s) again, open a **new chat**, ask the same question.
Expected difference: `google-genai` SDK, an adapter behind a Protocol, model name from
`get_settings()`, and a fake for tests.

Optional 20-second extra:
> Using #file:app/config.py, what settings will a RAG service still need?

---

## §3 · Agent mode builds ingestion (7 min)
**Plan** — pick the **planner** agent:
> Plan the implementation of demo/issues/01-document-ingestion.md. Keep it small enough
> to finish in one sitting.

Edit aloud, e.g.:
> Use a simple NumPy cosine-similarity store persisted to DATA_DIR — no Chroma. Go.

**Build** — switch the dropdown to **Agent**, then in the chat box type:
> /build-from-issue

When it asks for `issue`, press Enter to accept the default `01-document-ingestion`
(or type it). Narrate while it runs: files appearing, terminal approvals, a failing test it fixes.

*(Fallback if `/build-from-issue` doesn't appear: paste this instead)*
> Implement that plan. Write the tests first, then the code. Use a fake Gemini adapter in
> the tests. Run `ruff check .` and `pytest -q` and keep going until both pass.

---

## §4 · Payoff (2 min)
```powershell
python demo/checkpoint.py restore act-4
uvicorn app.main:app --reload
```
Browser → http://localhost:8000/docs → `POST /documents` → upload a PDF from `data-samples/`
→ `POST /ask`:
```json
{ "question": "What were the main risks highlighted this year?", "top_k": 5 }
```
Point at `citations` — every claim traces to a chunk.

---

## §5 · Guardrails (2 min)
```powershell
git checkout demo/vulnerable-upload
```
Open `app/api/raw_files.py`, then in chat:
> /security-review

Then in **Agent** mode:
> Fix the path traversal you found using server-generated IDs, add a regression test,
> and run the tests.

---

## Rehearsal only — building the `act-4` checkpoint (not shown live)
Start from a clean `main` with `python demo/checkpoint.py save act-0`, then in **Agent** mode:
1. `/build-from-issue` → `01-document-ingestion` → wait for green.
2. `/build-from-issue` → `02-ask-with-citations` → wait for green.
3. Then paste:
> Add a real Gemini adapter that implements the same Protocol as the fake, using the
> google-genai SDK and the model names from get_settings(). Wire it in as the default
> outside tests. Don't change the tests.
4. Run `uvicorn app.main:app --reload`, upload a PDF and ask a question at
   http://localhost:8000/docs. Fix anything that breaks (ask Copilot!).
5. `python demo/checkpoint.py save act-4`, then `python demo/plant_vuln.py`,
   then `git checkout live` to get back.

---

## Back-pocket (only if you're ahead of time)
> Draw a Mermaid sequence diagram of the /ask request flow from the code as it is now.
