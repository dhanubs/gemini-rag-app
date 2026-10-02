# Run of show — AI-assisted development with GitHub Copilot in VS Code (18 min)

**Thesis:** the developer's job is moving from *typing code* to *specifying intent, curating
context and reviewing output*. Everything happens in VS Code; paste prompts from `demo/PROMPTS.md`.

| # | Min | Segment | Copilot surface | Line to land |
|---|---|---|---|---|
| 0 | 1 | Framing | — | "Four levels: complete → chat → agent → review. We'll climb them in 18 minutes." |
| 1 | 2 | Flow | Ghost text, **Next Edit Suggestions** | "It predicts my *next edit*, not just my next token." |
| 2 | 3 | Context | **Ask** mode, instructions on/off, `#file`, model picker | "Output quality is a function of context." |
| 3 | 7 | Build | **planner** agent → **Agent** mode, tests first | "I review a plan and a diff, not every keystroke." |
| 4 | 2 | Payoff | Run the app, real Gemini answer with citations | "Working software, grounded answers." |
| 5 | 2 | Guard | `/security-review` prompt file, agent fixes it | "AI writes, AI and humans review." |
| 6 | 1 | Close | — | "The skills transfer; the tool is secondary." |

---

## What's built, and what isn't

**Already in the repo (on `main` today):**
| Area | What exists |
|---|---|
| App | `app/main.py` with only `GET /health`; `app/config.py` settings; an **empty** `app/services/` folder |
| Tests | `tests/test_health.py` (1 test) |
| Copilot context | `.github/copilot-instructions.md`, `.github/instructions/`, `.github/prompts/`, `.github/agents/planner.agent.md`, `AGENTS.md` |
| Demo kit | `demo/*.py` scripts, `demo/issues/*.md` specs, this file, `PROMPTS.md` |

**Not built yet: no RAG code exists.** Chunking, the Gemini adapter, the vector store,
`POST /documents` and `POST /ask` are only *specified* (in `demo/issues/01` and `02`).
**Copilot builds them**, in two passes:

| When | Who builds what | Saved as |
|---|---|---|
| **Rehearsal (you, beforehand)** | Copilot Agent mode builds *everything*: issue 01 (ingestion) **and** issue 02 (`/ask` with citations). You get it working against real Gemini. | checkpoint `act-4` |
| | `python demo/plant_vuln.py` adds the insecure endpoint on top | branch `demo/vulnerable-upload` |
| **Live §1** | You + ghost text write `chunk_text()` | (thrown away) |
| **Live §3** | Agent mode rebuilds **issue 01 only** (ingestion) from a clean start | (thrown away) |
| **Live §4** | Nothing is built: you switch to `act-4` from rehearsal and run it | — |
| **Live §5** | Nothing is built: you switch to `demo/vulnerable-upload`, Copilot finds and fixes the bug | — |

So the audience watches Copilot build half the feature live (§3), then sees the finished
version you built the same way in rehearsal (§4). Say that openly; it's part of the story.

```
main ──► [act-0: clean start] ──rehearsal build──► [act-4: full RAG app] ──► [demo/vulnerable-upload]
              ▲ live §1–§3 start here                    ▲ live §4               ▲ live §5
```

---

## Setup (day before)

1. Clone `main`, then in the VS Code terminal (PowerShell on Windows):
   ```powershell
   python -m venv .venv
   .venv\Scripts\Activate.ps1          # if blocked: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   pip install -e ".[dev]"
   pytest -q                           # expect: 1 passed
   copy .env.example .env              # then set GEMINI_API_KEY in .env
   ```
   All demo scripts are Python (`python demo/...py`), so they run the same on Windows, macOS and Linux.
2. Your `.env` holds `GEMINI_API_KEY`. Put 1–2 PDFs in `data-samples/`
   (e.g. a company annual report).
3. VS Code: GitHub Copilot + Copilot Chat + Python extensions, signed in; select the `.venv`
   interpreter; trust the workspace.
4. Sanity checks in Chat:
   - Ask *"What are this repo's architecture rules?"* → **References** lists `copilot-instructions.md`.
   - Type `/` → `build-from-issue`, `new-endpoint`, `write-tests`, `security-review` appear.
   - Agent/mode picker shows `planner`.
5. **Build the fallback (most important).** Follow *"Rehearsal only"* in `demo/PROMPTS.md`
   (`/build-from-issue` for issues 01 then 02, add the real Gemini adapter, test in the browser).
   The checkpoint commands are:
   ```powershell
   git checkout main; python demo/checkpoint.py save act-0   # clean starting point
   # ...after the full rehearsal build is green and working:
   python demo/checkpoint.py save act-4                        # ingestion + /ask, real answers
   python demo/plant_vuln.py                                  # branch demo/vulnerable-upload on top of act-4
   ```
6. Rehearse the whole 18 minutes twice more, starting each time from `python demo/checkpoint.py restore act-0`.

## T-5 minutes

- `python demo/checkpoint.py restore act-0`; close all editor tabs; open `app/config.py` and `demo/PROMPTS.md`.
- New chat session. Notifications off. Font size is already large via `.vscode/settings.json`.
- Terminal open at repo root with the venv active.

---

## The segments

### 0 · Framing (1 min)
Show the repo tree. "Empty FastAPI app plus a few markdown files that teach the AI how we work.
In 18 minutes it'll answer questions about a PDF, with citations."

### 1 · Flow: completions + Next Edit Suggestions (2 min)
Prompts §1. Type a signature and docstring, accept the ghost text. Then rename a parameter and
**Tab through** the follow-up edits Copilot proposes. Don't dwell — everyone has seen autocomplete.

### 2 · Context engineering (3 min)
Prompts §2. Ask the same question twice: with instruction files **off**, then **on**. Point at
the difference (right SDK, adapter layer, model from config, test fake) and open
`.github/copilot-instructions.md` for 15 seconds. Flash the model picker: "different models
for different jobs."

### 3 · Agent mode builds a feature (7 min)
Prompts §3.
- Switch to **planner**; paste the plan prompt. Edit one thing in the plan aloud
  ("NumPy store, not Chroma") — the human stays in charge.
- Switch to **Agent** mode; paste the build prompt. While it runs, narrate:
  files appearing, the **terminal approval** prompts, a failing test it then fixes itself.
- When green: open the diff view, show **Keep / Undo** per file.
- **Hard stop at minute 13.** If it's not green: "this is exactly why we have checkpoints" →
  `python demo/checkpoint.py restore act-4`.

### 4 · Payoff (2 min)
`python demo/checkpoint.py restore act-4` (the rehearsal build with `/ask` finished — say so honestly:
"I asked it to do the Q&A half yesterday the same way"). Prompts §4: run the app, upload the
PDF in Swagger, ask a question, show the citations.

### 5 · Guardrails (2 min)
`git checkout demo/vulnerable-upload`, open `app/api/raw_files.py`. Prompts §5: run
`/security-review` → it flags path traversal. Agent mode: "fix it and add a test" → green.

### 6 · Close (1 min)
- **Beyond the IDE** (one sentence each, no demo): assign an issue to the Copilot coding agent →
  it opens a PR; Copilot code review on PRs; CodeQL Autofix.
- **Portable skills:** the same `AGENTS.md` drives Claude Code and Copilot's coding agent —
  specs, context files and review discipline transfer across tools.
- **Honest limits:** vague spec → vague code; architecture is still your call; review everything.

---

## If something breaks
| Problem | Do this |
|---|---|
| Agent goes off the rails | Narrate it ("this is why we review"), `python demo/checkpoint.py restore act-4` |
| Agent slow / rate-limited | Switch model in the picker, or skip to the restore |
| No network | Present from `act-4` with pre-taken screenshots of the chat |
| Gemini API error in §4 | Show the passing test suite instead — the fakes prove the flow |
