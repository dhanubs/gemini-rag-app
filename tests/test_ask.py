import asyncio

import pytest
from fastapi.testclient import TestClient

from app.adapters.vector_store import JsonVectorStore
from app.api.ask import get_question_answering_service
from app.main import app
from app.services.question_answering import QuestionAnsweringService


class FakeGeminiAdapter:
    def __init__(self) -> None:
        self.query_embedding = [1.0, 0.0]
        self.prompts: list[str] = []

    async def embed(self, texts: list[str]) -> list[list[float]]:
        return [self.query_embedding for _ in texts]

    async def generate(self, prompt: str) -> str:
        self.prompts.append(prompt)
        return "Paris is the capital."


@pytest.fixture
def ask_client(tmp_path):
    gemini = FakeGeminiAdapter()
    store = JsonVectorStore(data_dir=tmp_path)
    asyncio.run(
        store.store_document(
            "document-1",
            "facts.txt",
            [
                {
                    "chunk_id": "chunk-low",
                    "text": "A distractor unrelated to the question.",
                    "embedding": [0.6, 0.8],
                },
                {
                    "chunk_id": "chunk-best",
                    "text": "The capital is Paris.",
                    "embedding": [1.0, 0.0],
                },
            ],
        )
    )
    service = QuestionAnsweringService(
        embedder=gemini,
        generator=gemini,
        vector_store=store,
        similarity_threshold=0.9,
    )
    app.dependency_overrides[get_question_answering_service] = lambda: service

    with TestClient(app) as test_client:
        yield test_client, gemini

    app.dependency_overrides.clear()


def test_ask_returns_grounded_answer_with_top_ranked_citation(ask_client):
    client, gemini = ask_client

    response = client.post(
        "/ask",
        json={"question": "What is the capital?", "top_k": 1},
    )

    assert response.status_code == 200
    assert response.json() == {
        "answer": "Paris is the capital.",
        "citations": [
            {
                "document_id": "document-1",
                "chunk_id": "chunk-best",
                "snippet": "The capital is Paris.",
            }
        ],
    }
    assert len(gemini.prompts) == 1
    assert "ONLY" in gemini.prompts[0]
    assert "The capital is Paris." in gemini.prompts[0]
    assert "A distractor unrelated to the question." not in gemini.prompts[0]


def test_ask_returns_no_match_without_generating_answer(ask_client):
    client, gemini = ask_client
    gemini.query_embedding = [0.0, 1.0]

    response = client.post("/ask", json={"question": "What is the capital?"})

    assert response.status_code == 200
    assert response.json() == {
        "answer": "I couldn't find that in your documents.",
        "citations": [],
    }
    assert gemini.prompts == []


def test_ask_rejects_blank_question(ask_client):
    client, _ = ask_client

    response = client.post("/ask", json={"question": "  "})

    assert response.status_code == 422