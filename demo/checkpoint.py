"""Safety net for live demos. Works on Windows, macOS and Linux.

    python demo/checkpoint.py save act-0      snapshot current work as local branch demo/act-0
    python demo/checkpoint.py restore act-4   stash live changes and jump to that snapshot
    python demo/checkpoint.py list
"""

import subprocess
import sys
from datetime import datetime


def git(*args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(["git", *args], check=check, text=True, capture_output=True)


def save(name: str) -> None:
    git("add", "-A")
    if git("diff", "--cached", "--quiet", check=False).returncode != 0:
        git("commit", "-qm", f"checkpoint: {name}")
    git("branch", "-f", f"demo/{name}")
    sha = git("rev-parse", "--short", "HEAD").stdout.strip()
    print(f"saved demo/{name} @ {sha}")


def restore(name: str) -> None:
    git("stash", "push", "-u", "-qm", f"pre-restore {datetime.now():%H%M%S}", check=False)
    git("checkout", "-q", "-B", "live", f"demo/{name}")
    print(f"now on 'live' at demo/{name} (previous work stashed)")


def main() -> None:
    cmd, name = (sys.argv[1:] + ["list", ""])[:2]
    if cmd == "list":
        print(git("branch", "--list", "demo/*").stdout, end="")
    elif cmd in ("save", "restore") and name:
        {"save": save, "restore": restore}[cmd](name)
    else:
        sys.exit("usage: python demo/checkpoint.py {save|restore|list} [name]")


if __name__ == "__main__":
    main()
