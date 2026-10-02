from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from pydantic import BaseModel

from app.adapters.gemini import GeminiEmbeddingAdapter
from app.adapters.vector_store import JsonVectorStore
from app.config import get_settings
from app.errors import EmptyDocumentError, InvalidDocumentError, UnsupportedDocumentTypeError
from app.services.document_ingestion import DocumentIngestionService

router = APIRouter()
MAX_UPLOAD_SIZE = 10 * 1024 * 1024


class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    chunk_count: int


def get_document_ingestion_service(request: Request) -> DocumentIngestionService:
    """Return the app's configured document ingestion service."""
    service = getattr(request.app.state, "document_ingestion_service", None)
    if service is None:
        settings = get_settings()
        if not settings.gemini_api_key:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="GEMINI_API_KEY must be configured to ingest documents",
            )
        service = DocumentIngestionService(
            embedder=GeminiEmbeddingAdapter(
                api_key=settings.gemini_api_key,
                model=settings.embedding_model,
            ),
            vector_store=JsonVectorStore(data_dir=settings.data_dir),
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
        )
        request.app.state.document_ingestion_service = service
    return service


@router.post(
    "/documents",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    file: Annotated[UploadFile, File()],
    service: Annotated[DocumentIngestionService, Depends(get_document_ingestion_service)],
) -> DocumentUploadResponse:
    """Upload a PDF, Markdown, or text document for ingestion."""
    content = await file.read(MAX_UPLOAD_SIZE + 1)
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail="The uploaded file exceeds the 10 MB limit",
        )

    try:
        result = await service.ingest(file.filename or "", content)
    except UnsupportedDocumentTypeError as error:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=str(error),
        ) from error
    except (InvalidDocumentError, EmptyDocumentError) as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error

    return DocumentUploadResponse(
        document_id=result.document_id,
        filename=result.filename,
        chunk_count=result.chunk_count,
    )