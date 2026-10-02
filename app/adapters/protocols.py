from typing import Protocol, TypedDict


class EmbeddedChunk(TypedDict):
    chunk_id: str
    text: str
    embedding: list[float]


class RetrievedChunk(TypedDict):
    document_id: str
    chunk_id: str
    text: str
    similarity: float


class EmbeddingAdapter(Protocol):
    async def embed(self, texts: list[str]) -> list[list[float]]:
        """Return one embedding vector for each input text."""


class VectorStore(Protocol):
    async def store_document(
        self,
        document_id: str,
        filename: str,
        chunks: list[EmbeddedChunk],
    ) -> None:
        """Persist a document and its embedded chunks."""

    async def search(self, embedding: list[float], top_k: int) -> list[RetrievedChunk]:
        """Return the most similar persisted chunks."""


class GenerationAdapter(Protocol):
    async def generate(self, prompt: str) -> str:
        """Generate a response from the supplied prompt."""