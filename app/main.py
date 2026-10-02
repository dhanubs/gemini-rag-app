from fastapi import FastAPI

from app.api.ask import router as ask_router
from app.api.documents import router as documents_router

app = FastAPI(title="Gemini RAG App", version="0.1.0")
app.include_router(documents_router)
app.include_router(ask_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
