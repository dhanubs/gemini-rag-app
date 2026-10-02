---
applyTo: "tests/**/*.py"
---
# Tests

- Arrange / Act / Assert, separated by blank lines. One behaviour per test.
- Name tests `test_<unit>_<expected_behaviour>`.
- Replace the Gemini adapter with a deterministic fake (e.g. hash-based embeddings, canned
  answers). Never require `GEMINI_API_KEY` to run the suite.
- Use `tmp_path` for anything that touches disk.
