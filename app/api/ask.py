from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field, field_validator

from app.adapters.gemini import GeminiEmbeddingAdapter, GeminiGenerationAdapter
from app.adapters.vector_store import JsonVectorStore
from app.config import get_settings
from app.services.question_answering import QuestionAnsweringService

router = APIRouter()


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)
    top_k: int = Field(default=5, gt=0)

    @field_validator("question")
    @classmethod
    def question_must_not_be_blank(cls, question: str) -> str:
        if not question.strip():
            raise ValueError("question must not be blank")
        return question.strip()


class CitationResponse(BaseModel):
    document_id: str
    chunk_id: str
    snippet: str


class AskResponse(BaseModel):
    answer: str
    citations: list[CitationResponse]


def get_question_answering_service(request: Request) -> QuestionAnsweringService:
    """Return the app's configured question-answering service."""
    service = getattr(request.app.state, "question_answering_service", None)
    if service is None:
        settings = get_settings()
        if not settings.gemini_api_key:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="GEMINI_API_KEY must be configured to answer questions",
            )
        service = QuestionAnsweringService(
            embedder=GeminiEmbeddingAdapter(
                api_key=settings.gemini_api_key,
                model=settings.embedding_model,
            ),
            generator=GeminiGenerationAdapter(
                api_key=settings.gemini_api_key,
                model=settings.generation_model,
            ),
            vector_store=JsonVectorStore(data_dir=settings.data_dir),
            similarity_threshold=settings.similarity_threshold,
        )
        request.app.state.question_answering_service = service
    return service


@router.post("/ask", response_model=AskResponse)
async def ask_question(
    request: AskRequest,
    service: Annotated[QuestionAnsweringService, Depends(get_question_answering_service)],
) -> AskResponse:
    """Answer a question using retrieved document chunks and return citations."""
    result = await service.answer(request.question, request.top_k)
    return AskResponse(
        answer=result.answer,
        citations=[
            CitationResponse(
                document_id=citation.document_id,
                chunk_id=citation.chunk_id,
                snippet=citation.snippet,
            )
            for citation in result.citations
        ],
    )