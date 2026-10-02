---
mode: agent
description: Add focused tests for the selected code, including edge cases
---
Write pytest tests for ${selection} (or ${file} if nothing is selected).

- Cover the happy path, boundary values, and at least two failure modes.
- Follow [tests.instructions](../instructions/tests.instructions.md).
- Do not change production code. If you find a bug, write a failing test and tell me.
- Run `pytest -q` and report the result.
