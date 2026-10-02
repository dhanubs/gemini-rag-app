from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration, read from environment variables or .env."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    gemini_api_key: str = ""
    generation_model: str = "gemini-2.5-flash"
    embedding_model: str = "gemini-embedding-001"
    data_dir: str = "./data"
    chunk_size: int = 800
    chunk_overlap: int = 100
    similarity_threshold: float = 0.35


@lru_cache
def get_settings() -> Settings:
    return Settings()
