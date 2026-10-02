from dataclasses import dataclass

from app.adapters.protocols import EmbeddingAdapter, GenerationAdapter, VectorStore

NO_MATCH_ANSWER = "I couldn't find that in your documents."
MAX_CITATION_SNIPPET_LENGTH = 240


@dataclass(frozen=True)
class Citation:
    document_id: str
    chunk_id: str
    snippet: str


@dataclass(frozen=True)
class Answer:
    answer: str
    citations: list[Citation]


class QuestionAnsweringService:
    """Retrieve relevant chunks and generate answers grounded in their text."""

    def __init__(
        self,
        embedder: EmbeddingAdapter,
        generator: GenerationAdapter,
        vector_store: VectorStore,
        similarity_threshold: float,
    ) -> None:
        self.embedder = embedder
        self.generator = generator
        self.vector_store = vector_store
        self.similarity_threshold = similarity_threshold

    async def answer(self, question: str, top_k: int = 5) -> Answer:
        """Answer a question from the most similar stored document chunks."""
        query_embeddings = await self.embedder.embed([question])
        if not query_embeddings or not query_embeddings[0]:
            raise RuntimeError("The embedding adapter returned no query vector")

        matches = await self.vector_store.search(query_embeddings[0], top_k)
        if not matches or matches[0]["similarity"] < self.similarity_threshold:
            return Answer(NO_MATCH_ANSWER, [])

        context = "\n\n".join(
            f"[document_id={match['document_id']}, chunk_id={match['chunk_id']}]\n{match['text']}"
            for match in matches
        )
        prompt = self._build_prompt(question, context)
        generated_answer = await self.generator.generate(prompt)
        citations = [
            Citation(
                document_id=match["document_id"],
                chunk_id=match["chunk_id"],
                snippet=match["text"][:MAX_CITATION_SNIPPET_LENGTH].strip(),
            )
            for match in matches
        ]
        return Answer(generated_answer, citations)

    @staticmethod
    def _build_prompt(question: str, context: str) -> str:
        return (
            "Answer the question using ONLY the information in the provided context. "
            "Do not use outside knowledge or invent facts. If the context does not support "
            "an answer, say that you cannot find it in the documents.\n\n"
            f"CONTEXT:\n{context}\n\nQUESTION:\n{question}"
        )