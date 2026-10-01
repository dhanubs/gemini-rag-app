#!/usr/bin/env bash
# Safety net for live demos.
#   demo/checkpoint.sh save act-3      -> snapshot current work as local branch demo/act-3
#   demo/checkpoint.sh restore act-3   -> throw away live changes and jump to that snapshot
#   demo/checkpoint.sh list
set -euo pipefail
cmd="${1:-list}"; name="${2:-}"
case "$cmd" in
  save)
    [[ -n "$name" ]] || { echo "usage: $0 save <name>"; exit 1; }
    git add -A
    git commit -qm "checkpoint: $name" --allow-empty
    git branch -f "demo/$name"
    echo "saved demo/$name @ $(git rev-parse --short HEAD)" ;;
  restore)
    [[ -n "$name" ]] || { echo "usage: $0 restore <name>"; exit 1; }
    git stash push -u -qm "pre-restore $(date +%H%M%S)" || true
    git checkout -q -B "live" "demo/$name"
    echo "now on 'live' at demo/$name (previous work stashed)" ;;
  list)
    git branch --list 'demo/*' ;;
  *) echo "usage: $0 {save|restore|list} [name]"; exit 1 ;;
esac
