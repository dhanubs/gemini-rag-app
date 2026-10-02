import json
from io import BytesIO

import pytest
from fastapi.testclient import TestClient
from pypdf import PdfWriter
from pypdf.generic import DecodedStreamObject, DictionaryObject, NameObject

from app.adapters.vector_store import JsonVectorStore
from app.api.documents import get_document_ingestion_service
from app.main import app
from app.services.chunking import split_text
from app.services.document_ingestion import DocumentIngestionService


class FakeGeminiAdapter:
    def __init__(self) -> None:
        self.embedded_texts: list[str] = []

    async def embed(self, texts: list[str]) -> list[list[float]]:
        self.embedded_texts.extend(texts)
        return [[float(len(text)), float(index)] for index, text in enumerate(texts)]


@pytest.fixture
def ingestion_service(tmp_path):
    embedder = FakeGeminiAdapter()
    store = JsonVectorStore(data_dir=tmp_path)
    service = DocumentIngestionService(
        embedder=embedder,
        vector_store=store,
        chunk_size=3,
        chunk_overlap=1,
    )
    return service, embedder, tmp_path / "vectors.json"


@pytest.fixture
def client(ingestion_service):
    service, _, _ = ingestion_service
    app.dependency_overrides[get_document_ingestion_service] = lambda: service

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def create_text_pdf(text: str) -> bytes:
    writer = PdfWriter()
    page = writer.add_blank_page(width=300, height=300)
    font = DictionaryObject(
        {
            NameObject("/Type"): NameObject("/Font"),
            NameObject("/Subtype"): NameObject("/Type1"),
            NameObject("/BaseFont"): NameObject("/Helvetica"),
        }
    )
    font_reference = writer._add_object(font)
    page[NameObject("/Resources")] = DictionaryObject(
        {NameObject("/Font"): DictionaryObject({NameObject("/F1"): font_reference})}
    )
    content = DecodedStreamObject()
    content.set_data(f"BT /F1 12 Tf 10 10 Td ({text}) Tj ET".encode("ascii"))
    page[NameObject("/Contents")] = writer._add_object(content)
    output = BytesIO()
    writer.write(output)
    return output.getvalue()


@pytest.mark.parametrize("filename", ["notes.txt", "notes.md"])
def test_upload_document_embeds_chunks_and_persists(client, ingestion_service, filename):
    _, embedder, vector_store_path = ingestion_service

    response = client.post(
        "/documents",
        files={"file": (filename, "alpha beta gamma delta epsilon", "text/plain")},
    )

    assert response.status_code == 201
    result = response.json()
    assert result["filename"] == filename
    assert result["chunk_count"] == 2
    assert len(embedder.embedded_texts) == 2

    stored_documents = json.loads(vector_store_path.read_text(encoding="utf-8"))["documents"]
    stored_document = stored_documents[result["document_id"]]
    assert stored_document["filename"] == filename
    assert len(stored_document["chunks"]) == 2
    assert all(chunk["embedding"] for chunk in stored_document["chunks"])


def test_upload_document_extracts_pdf_text(client, ingestion_service):
    _, embedder, _ = ingestion_service

    response = client.post(
        "/documents",
        files={
            "file": (
                "report.pdf",
                create_text_pdf("alpha beta gamma delta"),
                "application/pdf",
            )
        },
    )

    assert response.status_code == 201
    assert response.json()["chunk_count"] == 2
    assert embedder.embedded_texts == ["alpha beta gamma", "gamma delta"]


def test_upload_document_rejects_unsupported_extension(client):
    response = client.post(
        "/documents",
        files={"file": ("notes.docx", b"not supported", "application/octet-stream")},
    )

    assert response.status_code == 415


def test_upload_document_rejects_oversized_file(client):
    response = client.post(
        "/documents",
        files={"file": ("large.txt", b"x" * (10 * 1024 * 1024 + 1), "text/plain")},
    )

    assert response.status_code == 413


def test_split_text_creates_overlapping_chunks():
    chunks = split_text("one two three four five", chunk_size=3, chunk_overlap=1)

    assert chunks == ["one two three", "three four five"]


def test_split_text_rejects_invalid_overlap():
    with pytest.raises(ValueError):
        split_text("one two", chunk_size=2, chunk_overlap=2)