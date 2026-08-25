"""
Application Settings

Environment-based configuration using Pydantic Settings.
"""

import os
from pathlib import Path
from typing import List
from dotenv import dotenv_values, load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Explicitly load .env file into environment so project-specific keys take precedence
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=True)


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
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
    LLM_PROVIDER: str = "openai"
    GOOGLE_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Firebase
    FIREBASE_CREDENTIALS_PATH: str = "./firebase-credentials.json"
    FIREBASE_CREDENTIALS_JSON: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]


settings = Settings()
