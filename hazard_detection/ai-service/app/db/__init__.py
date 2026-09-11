"""
DB package — convenient re-exports.

Routes / services can simply write::

    from app.db import Base, get_db, SessionLocal
"""

from app.db.base import Base
from app.db.database import get_db, SessionLocal, engine

__all__ = [
    "Base",
    "get_db",
    "SessionLocal",
    "engine",
]
