# Ingest documents: upload, chunk and embed

**Labels:** enhancement, rag

## Context
Users need to upload documents so they can later ask questions about them.

## Acceptance criteria
- [ ] `POST /documents` accepts a multipart upload of `.pdf`, `.md` or `.txt` (max 10 MB)
- [ ] Returns `201` with `{document_id, filename, chunk_count}`
- [ ] Text is split into overlapping chunks (size and overlap configurable)
- [ ] Each chunk is embedded through the Gemini adapter and stored in the vector store
- [ ] Rejects unsupported types with `415` and oversized files with `413`
- [ ] Tests use the fake Gemini adapter; no network calls

## Notes
Follow the layering in `.github/copilot-instructions.md`. A simple local vector store
(NumPy cosine similarity persisted to `DATA_DIR`) is fine for now.
