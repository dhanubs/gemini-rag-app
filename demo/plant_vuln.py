"""Create branch demo/vulnerable-upload with a deliberately insecure endpoint.

Used in segment 5 (guardrails). Run it on top of your act-4 checkpoint. NEVER merge this branch.

    python demo/plant_vuln.py
"""

import subprocess
from pathlib import Path

VULNERABLE_ROUTER = '''import os

from fastapi import APIRouter, UploadFile
from fastapi.responses import FileResponse

router = APIRouter()
UPLOAD_DIR = "./data/uploads"


@router.post("/raw/{filename}")
async def save_raw(filename: str, file: UploadFile) -> dict[str, str]:
    # Intentionally vulnerable: user-controlled filename joined onto a path.
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as out:
        out.write(await file.read())
    return {"saved": path}


@router.get("/raw/{filename}")
def read_raw(filename: str) -> FileResponse:
    return FileResponse(os.path.join(UPLOAD_DIR, filename))
'''

MOUNT = '''

from app.api.raw_files import router as raw_router  # noqa: E402

app.include_router(raw_router)
'''


def git(*args: str) -> None:
    subprocess.run(["git", *args], check=True)


def main() -> None:
    git("checkout", "-q", "-b", "demo/vulnerable-upload")
    api = Path("app/api")
    api.mkdir(parents=True, exist_ok=True)
    (api / "__init__.py").touch()
    (api / "raw_files.py").write_text(VULNERABLE_ROUTER, encoding="utf-8")
    with Path("app/main.py").open("a", encoding="utf-8") as f:
        f.write(MOUNT)
    git("add", "-A")
    git("commit", "-qm", "Add raw file upload/download endpoints")
    print("Branch demo/vulnerable-upload ready (local only).")


if __name__ == "__main__":
    main()
