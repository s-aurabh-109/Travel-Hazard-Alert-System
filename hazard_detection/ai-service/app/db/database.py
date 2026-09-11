"""
Database engine and session management.

Provides:
    * ``engine``        – the SQLAlchemy async/sync engine
    * ``SessionLocal``  – a session factory for scripts / Celery tasks
    * ``get_db()``      – a FastAPI dependency that yields a session per request
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import get_settings

settings = get_settings()

# ── Engine ────────────────────────────────────────────
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,          # reconnect stale connections
    pool_size=10,                # default pool size
    max_overflow=20,             # extra connections when pool is full
    echo=settings.DEBUG,         # log SQL when DEBUG=True
)

# ── Session Factory ───────────────────────────────────
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


# ── FastAPI Dependency ────────────────────────────────
def get_db() -> Generator[Session, None, None]:
    """
    Yield a database session for the duration of a single request.

    Usage in a route::

        @router.get("/items")
        def list_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
