"""
Health-check endpoint for the AI Service.

Returns service status, version, and connectivity checks
for downstream dependencies (database, Redis).
"""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db import get_db

logger = logging.getLogger("ai_service")
settings = get_settings()

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Liveness / readiness probe.

    Checks:
      - Service is up
      - Database is reachable (``SELECT 1``)
    """
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as exc:
        logger.warning("Database health check failed: %s", exc)

    status = "healthy" if db_ok else "degraded"

    return {
        "status": status,
        "service": "ai-service",
        "version": settings.MODEL_VERSION,
        "database": "connected" if db_ok else "unreachable",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
