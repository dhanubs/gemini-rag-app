# List and delete documents

**Labels:** enhancement, good first issue

> Demo note: assign this one to **Copilot** live in Act 5 — it's small and well specified.

## Acceptance criteria
- [ ] `GET /documents` returns `[{document_id, filename, chunk_count, uploaded_at}]`
- [ ] `DELETE /documents/{document_id}` removes the document and all of its chunks; returns `204`
- [ ] Deleting an unknown id returns `404`
- [ ] Tests for all three behaviours
