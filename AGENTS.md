# AGENTS.md

Guidance for any AI coding agent working in this repo (GitHub Copilot coding agent, Claude Code,
and others). Copilot-specific detail lives in `.github/copilot-instructions.md`; the rules below
are the shared contract.

## Setup
```bash
python -m venv .venv
.venv\Scripts\Activate.ps1      # Windows PowerShell
# source .venv/bin/activate     # macOS / Linux
pip install -e ".[dev]"
copy .env.example .env  # (cp on macOS/Linux)   # only needed to run against real Gemini
```

## Verify your work
```bash
ruff check .
pytest -q
```
Both must pass before you open or update a pull request.

## Ground rules
- Follow the layering in `.github/copilot-instructions.md` (api → services → adapters).
- Tests never call the real Gemini API; use the fake adapter.
- Keep PRs focused on the issue you were given. No drive-by refactors.
- PR description: what changed, why, how it was tested, and any follow-ups.
- Never commit `.env`, API keys, or files under `data/`.
