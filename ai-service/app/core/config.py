"""
Application settings loaded from environment variables.

Uses pydantic-settings so every value can be overridden via
the shell, a .env file, or docker-compose `environment:` block.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration for the AI Service."""

    # ── Database ──────────────────────────────────────
    DATABASE_URL: str = (
        "postgresql+psycopg://postgres:postgres@postgres:5432/ai_db"
    )

    # ── Redis ─────────────────────────────────────────
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_URL: str = "redis://redis:6379/0"

    # ── Application ───────────────────────────────────
    MODEL_VERSION: str = "v1.0"
    LOG_LEVEL: str = "INFO"
    DEBUG: bool = False

    # ── CORS ──────────────────────────────────────────
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "*",
    ]

    # ── Security ──────────────────────────────────────
    API_KEY: str = ""
    SECRET_KEY: str = "change-me-in-production"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    """Return a cached singleton of application settings."""
    return Settings()
