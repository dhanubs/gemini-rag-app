import asyncio
import json
import math
import threading
from pathlib import Path

from app.adapters.protocols import EmbeddedChunk, RetrievedChunk


class JsonVectorStore:
    """Persist document chunks and their embeddings in a local JSON file."""

    def __init__(self, data_dir: str | Path) -> None:
        self.path = Path(data_dir) / "vectors.json"
        self._lock = threading.Lock()

    async def store_document(
        self,
        document_id: str,
        filename: str,
        chunks: list[EmbeddedChunk],
    ) -> None:
        """Persist a document and its embedded chunks without blocking the event loop."""
        await asyncio.to_thread(self._store_document, document_id, filename, chunks)

    async def search(self, embedding: list[float], top_k: int) -> list[RetrievedChunk]:
        """Find the highest cosine-similarity chunks without blocking the event loop."""
        return await asyncio.to_thread(self._search, embedding, top_k)

    def _store_document(
        self,
        document_id: str,
        filename: str,
        chunks: list[EmbeddedChunk],
    ) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self._lock:
            if self.path.exists():
                data = json.loads(self.path.read_text(encoding="utf-8"))
            else:
                data = {"documents": {}}

            data["documents"][document_id] = {
                "filename": filename,
                "chunks": chunks,
            }
            temporary_path = self.path.with_suffix(".tmp")
            temporary_path.write_text(json.dumps(data), encoding="utf-8")
            temporary_path.replace(self.path)

    def _search(self, query_embedding: list[float], top_k: int) -> list[RetrievedChunk]:
        if top_k <= 0 or not query_embedding:
            return []

        with self._lock:
            if not self.path.exists():
                return []
            data = json.loads(self.path.read_text(encoding="utf-8"))

        matches: list[RetrievedChunk] = []
        for document_id, document in data.get("documents", {}).items():
            for chunk in document.get("chunks", []):
                chunk_embedding = chunk.get("embedding", [])
                similarity = self._cosine_similarity(query_embedding, chunk_embedding)
                if similarity is not None:
                    matches.append(
                        {
                            "document_id": document_id,
                            "chunk_id": chunk["chunk_id"],
                            "text": chunk["text"],
                            "similarity": similarity,
                        }
                    )

        matches.sort(key=lambda match: match["similarity"], reverse=True)
        return matches[:top_k]

    @staticmethod
    def _cosine_similarity(left: list[float], right: list[float]) -> float | None:
        if not left or len(left) != len(right):
            return None

        left_norm = math.sqrt(sum(value * value for value in left))
        right_norm = math.sqrt(sum(value * value for value in right))
        if left_norm == 0 or right_norm == 0:
            return None

        dot_product = sum(
            left_value * right_value
            for left_value, right_value in zip(left, right, strict=True)
        )
        return dot_product / (left_norm * right_norm)