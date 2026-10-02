---
mode: ask
description: Review the current file or diff for security issues
---
Review ${file} for security issues relevant to a document-upload RAG service:
path traversal, unbounded uploads, prompt injection via document content, secret leakage
in logs, and missing input validation.

For each finding give: severity, the exact line, a one-sentence exploit scenario, and a fix.
If there is nothing material, say so — don't pad the list.
