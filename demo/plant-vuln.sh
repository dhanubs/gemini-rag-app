#!/usr/bin/env bash
# Creates branch demo/vulnerable-upload with a deliberately insecure endpoint, for the
# Copilot code review + CodeQL/Autofix moment in Act 6. NEVER merge this branch.
# Push it and open a PR, then let code scanning and Copilot review find the bug.
set -euo pipefail
git checkout -q -b demo/vulnerable-upload
mkdir -p app/api
cat > app/api/raw_files.py <<'PY'
import os

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
PY
cat >> app/main.py <<'PY'


from app.api.raw_files import router as raw_router  # noqa: E402

app.include_router(raw_router)
PY
git add -A && git commit -qm "Add raw file upload/download endpoints"
echo "Branch demo/vulnerable-upload ready. Push it and open a PR against main."
