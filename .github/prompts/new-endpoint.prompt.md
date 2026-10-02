---
mode: agent
description: Scaffold a new FastAPI endpoint end-to-end (schema, service, route, tests)
---
Create a new endpoint: **${input:endpoint:e.g. DELETE /documents/{id}}**

Purpose: ${input:purpose:what should it do?}

Follow the layering in [copilot-instructions](../copilot-instructions.md):
1. Write failing tests in `tests/` first, using the fake Gemini adapter.
2. Add Pydantic request/response models.
3. Implement the logic in `app/services/`, calling adapters only through their Protocols.
4. Add the thin route in `app/api/` and register it in `app/main.py`.
5. Run `ruff check . && pytest -q` and fix anything that fails.

Finish with a short summary of the files you changed.
