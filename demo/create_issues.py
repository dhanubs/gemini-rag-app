"""Create the seed issues in demo/issues/ on GitHub. Requires an authenticated `gh` CLI.

    python demo/create_issues.py [owner/repo]
"""

import subprocess
import sys
from pathlib import Path

LABELS_PREFIX = "**Labels:** "


def main() -> None:
    repo = sys.argv[1] if len(sys.argv) > 1 else "dhanubs/gemini-rag-app"
    for path in sorted((Path(__file__).parent / "issues").glob("*.md")):
        lines = path.read_text(encoding="utf-8").splitlines()
        title = lines[0].removeprefix("# ").strip()
        labels = [
            label.strip()
            for line in lines
            if line.startswith(LABELS_PREFIX)
            for label in line.removeprefix(LABELS_PREFIX).split(",")
        ]
        body = "\n".join(line for line in lines[1:] if not line.startswith(LABELS_PREFIX))
        for label in labels:
            subprocess.run(["gh", "label", "create", label, "--repo", repo, "--force"],
                           capture_output=True)
        cmd = ["gh", "issue", "create", "--repo", repo, "--title", title, "--body", body]
        if labels:
            cmd += ["--label", ",".join(labels)]
        subprocess.run(cmd, check=True)


if __name__ == "__main__":
    main()
