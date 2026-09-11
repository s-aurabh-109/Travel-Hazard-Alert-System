"""
Security utilities for the AI Service.

Provides an optional API-key dependency that can be
applied to routes requiring authentication.
"""

from fastapi import Depends, HTTPException, Security
from fastapi.security import APIKeyHeader

from app.core.config import get_settings

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(
    api_key: str | None = Security(_api_key_header),
) -> str | None:
    """
    Validate the X-API-Key header.

    If ``API_KEY`` is empty in settings the check is skipped
    (convenient during development).
    """
    settings = get_settings()

    # No key configured → open access (dev mode)
    if not settings.API_KEY:
        return None

    if api_key != settings.API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key.")

    return api_key
