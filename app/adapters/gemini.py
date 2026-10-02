from google import genai


class GeminiEmbeddingAdapter:
    """Generate embeddings through the official Gemini SDK."""

    def __init__(self, api_key: str, model: str) -> None:
        self.client = genai.Client(api_key=api_key)
        self.model = model

    async def embed(self, texts: list[str]) -> list[list[float]]:
        """Embed a batch of text chunks with the configured Gemini model."""
        response = await self.client.aio.models.embed_content(
            model=self.model,
            contents=texts,
        )
        return [list(embedding.values or []) for embedding in response.embeddings or []]


class GeminiGenerationAdapter:
    """Generate grounded answers through the official Gemini SDK."""

    def __init__(self, api_key: str, model: str) -> None:
        self.client = genai.Client(api_key=api_key)
        self.model = model

    async def generate(self, prompt: str) -> str:
        """Generate a response from the supplied grounded prompt."""
        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=prompt,
        )
        return response.text or ""