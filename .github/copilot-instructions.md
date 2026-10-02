# Copilot instructions — gemini-rag-app

## What this project is
A retrieval-augmented generation (RAG) service. Users upload documents (PDF, Markdown, text);
the service chunks them, embeds the chunks with Gemini, stores vectors locally, and answers
questions with **grounded answers and citations** back to the source chunks.

We deliberately own the retrieval pipeline (chunking, embeddings, vector store, ranking).
Do **not** use Gemini's managed File Search API — use Gemini only for embeddings and generation.

## Stack
- Python 3.11+, FastAPI, Pydantic v2, `pydantic-settings` for config
- Gemini via the official `google-genai` SDK (`from google import genai`) — not the legacy
  `google-generativeai` package
- Tests: `pytest` + FastAPI `TestClient`. Lint/format: `ruff`

## Architecture rules
- Layering: `app/api` (routes) → `app/services` (business logic) → `app/adapters`
  (Gemini client, vector store, file storage). Routes never call the Gemini SDK directly.
- All external calls (Gemini, disk) go through an adapter behind a small `Protocol`, so tests
  can inject a fake. **Tests must never hit the real Gemini API.**
- Configuration only through `app/config.py:get_settings()`. Model names are config, not literals.
- Every answer returned by `/ask` must include `citations: list[{document_id, chunk_id, snippet}]`.
  If retrieval finds nothing relevant, say so — never let the model answer ungrounded.

## Coding conventions
- Type hints everywhere; Pydantic models for every request/response body.
- Small functions, early returns, no bare `except`.
- Log with the stdlib `logging` module, never `print`.

## Security
- Never hardcode secrets. `GEMINI_API_KEY` comes from the environment.
- Treat uploaded filenames as untrusted: generate server-side IDs, never join a user-supplied
  name onto a filesystem path.
- Enforce upload size and content-type limits.

## Workflow
- Write or update tests **before** implementation for new behaviour.
- Run `ruff check . && pytest -q` before declaring a task done.
