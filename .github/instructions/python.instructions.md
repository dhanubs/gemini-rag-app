---
applyTo: "app/**/*.py"
---
# Application code

- Public functions get a one-line docstring describing intent, not mechanics.
- Use `async def` for route handlers that do I/O; keep CPU-bound chunking code sync.
- Raise `fastapi.HTTPException` only in the `app/api` layer; services raise domain exceptions
  defined in `app/errors.py`.
- Chunking defaults: ~800 tokens per chunk with ~100 token overlap; make both configurable.
