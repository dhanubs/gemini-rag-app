# Ask questions with grounded, cited answers

**Labels:** enhancement, rag

## Acceptance criteria
- [ ] `POST /ask` takes `{question, top_k=5}`
- [ ] Retrieves the top-k chunks by cosine similarity
- [ ] Prompts Gemini to answer **only** from the retrieved context
- [ ] Response: `{answer, citations: [{document_id, chunk_id, snippet}]}`
- [ ] If the best similarity is below a configurable threshold, return
      `"I couldn't find that in your documents."` with empty citations
- [ ] Tests cover the grounded path and the no-match path with the fake adapter
