#!/usr/bin/env bash
# Creates the seed issues in demo/issues/ on GitHub. Requires an authenticated `gh` CLI.
# Usage: demo/create-issues.sh [owner/repo]
set -euo pipefail
repo="${1:-dhanubs/gemini-rag-app}"
cd "$(dirname "$0")/issues"
for f in *.md; do
  title="$(head -n1 "$f" | sed 's/^# //')"
  labels="$(grep -m1 '^\*\*Labels:\*\*' "$f" | sed 's/\*\*Labels:\*\* //' || true)"
  body="$(tail -n +2 "$f" | grep -v '^\*\*Labels:\*\*')"
  for l in ${labels//,/ }; do gh label create "$l" --repo "$repo" --force >/dev/null 2>&1 || true; done
  gh issue create --repo "$repo" --title "$title" --body "$body" ${labels:+--label "$labels"}
done
