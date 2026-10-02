---
mode: agent
description: Build a feature end-to-end from an issue spec in demo/issues/ (tests first)
---
Implement the feature specified in **demo/issues/${input:issue:01-document-ingestion}.md**.

Work in this order:
1. Read the issue and the existing code. Briefly state your plan (files to create or change).
2. Write failing tests first, in `tests/`, using a **fake Gemini adapter** — never the real API.
3. Implement, following the layering in [copilot-instructions](../copilot-instructions.md):
   routes in `app/api/`, logic in `app/services/`, external calls in `app/adapters/`
   behind a `Protocol`. Reuse anything that already exists (e.g. `app/services/chunking.py`).
4. Add any new dependency to `pyproject.toml` and install it with `pip install -e ".[dev]"`.
5. Run `ruff check .` and `pytest -q`. Fix failures and repeat until both pass.

Finish with: files changed, how each acceptance criterion in the issue is met, and anything
you deliberately left out.
