# gemini-rag-app

Ask questions about your own documents. Upload PDFs, Markdown or text; get answers grounded in
your content, with citations, powered by Google Gemini.

> This repo also doubles as a **demo of AI-driven development with GitHub Copilot**.
> See [`demo/RUN_OF_SHOW.md`](demo/RUN_OF_SHOW.md).

## Quick start
```bash
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env          # add your GEMINI_API_KEY
uvicorn app.main:app --reload # http://localhost:8000/docs
pytest -q
```

## How the repo is set up for AI agents
| File | Used by | Purpose |
|---|---|---|
| `.github/copilot-instructions.md` | Copilot | Repo-wide context: stack, architecture, rules |
| `.github/instructions/*.instructions.md` | Copilot | Path-scoped rules (`applyTo` globs) |
| `.github/prompts/*.prompt.md` | Copilot Chat | Reusable `/commands` |
| `.github/agents/planner.agent.md` | Copilot Chat | Read-only architect persona |
| `.github/workflows/copilot-setup-steps.yml` | Copilot coding agent | Pre-installs deps so the agent can run tests |
| `.vscode/mcp.json` | VS Code agent mode | GitHub + Playwright MCP servers |
| `AGENTS.md` | Any agent | Shared contract: setup, verification, ground rules |
| `CLAUDE.md` | Claude Code | Imports `AGENTS.md` + Copilot instructions |

## Demo kit
- [`demo/RUN_OF_SHOW.md`](demo/RUN_OF_SHOW.md): 18-minute VS Code demo — setup, segments, fallbacks
- [`demo/PROMPTS.md`](demo/PROMPTS.md): paste-ready prompts for each act
- [`demo/issues/`](demo/issues): seed issues, created with `demo/create-issues.sh`
- `demo/checkpoint.sh`: save and restore per-act snapshots during the live demo
- `demo/plant-vuln.sh`: creates a deliberately vulnerable branch for the review/Autofix act
