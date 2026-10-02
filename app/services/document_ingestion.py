from dataclasses import dataclass
from io import BytesIO
from pathlib import PurePath
from uuid import uuid4

from pypdf import PdfReader
from pypdf.errors import PdfReadError

from app.adapters.protocols import EmbeddedChunk, EmbeddingAdapter, VectorStore
from app.errors import (
    EmptyDocumentError,
    InvalidDocumentError,
    UnsupportedDocumentTypeError,
)
from app.services.chunking import split_text

SUPPORTED_EXTENSIONS = {".pdf", ".md", ".txt"}


@dataclass(frozen=True)
class IngestedDocument:
    document_id: str
    filename: str
    chunk_count: int


class DocumentIngestionService:
    """Extract, chunk, embed, and store uploaded documents."""

    def __init__(
        self,
        embedder: EmbeddingAdapter,
        vector_store: VectorStore,
        chunk_size: int,
        chunk_overlap: int,
    ) -> None:
        self.embedder = embedder
        self.vector_store = vector_store
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    async def ingest(self, filename: str, content: bytes) -> IngestedDocument:
        """Ingest one supported document and return its assigned metadata."""
        extension = PurePath(filename.replace("\\", "/")).suffix.lower()
        if extension not in SUPPORTED_EXTENSIONS:
            raise UnsupportedDocumentTypeError("Only PDF, Markdown, and text files are supported")

        text = self._extract_text(extension, content)
        chunks = split_text(text, self.chunk_size, self.chunk_overlap)
        if not chunks:
            raise EmptyDocumentError("The document contains no extractable text")

        embeddings = await self.embedder.embed(chunks)
        if len(embeddings) != len(chunks):
            raise RuntimeError("The embedding adapter returned an unexpected number of vectors")

        document_id = str(uuid4())
        embedded_chunks: list[EmbeddedChunk] = [
            {"chunk_id": str(uuid4()), "text": chunk, "embedding": embedding}
            for chunk, embedding in zip(chunks, embeddings, strict=True)
        ]
        await self.vector_store.store_document(document_id, filename, embedded_chunks)
        return IngestedDocument(document_id, filename, len(embedded_chunks))

    def _extract_text(self, extension: str, content: bytes) -> str:
        if extension != ".pdf":
            try:
                return content.decode("utf-8")
            except UnicodeDecodeError as error:
                raise InvalidDocumentError("Text documents must be UTF-8 encoded") from error

        try:
            reader = PdfReader(BytesIO(content))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except (PdfReadError, ValueError, EOFError) as error:
            raise InvalidDocumentError("The uploaded PDF could not be parsed") from error