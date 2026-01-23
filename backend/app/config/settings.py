"""
Application Settings

Environment-based configuration using Pydantic Settings.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # Environment
    DEBUG: bool = False
    ENV: str = "development"

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "healthbridge"

    # ChromaDB
    CHROMA_PERSIST_DIR: str = "./data/chroma"

    # LLM
    LLM_PROVIDER: str = "gemini"
    GOOGLE_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Firebase
    FIREBASE_CREDENTIALS_PATH: str = "./firebase-credentials.json"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]


settings = Settings()
