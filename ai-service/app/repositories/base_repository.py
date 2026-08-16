"""
Generic base repository providing standard CRUD operations.

All domain repositories inherit from this class so that common
patterns (get by id, list, create, delete) are written once.
"""

import uuid
from typing import Generic, TypeVar, Type, List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Base repository with reusable CRUD helpers.

    Parameters
    ----------
    db : Session
        Active SQLAlchemy session (injected via FastAPI ``Depends``).
    model : Type[ModelType]
        The ORM model class this repository manages.
    """

    def __init__(self, db: Session, model: Type[ModelType]):
        self.db = db
        self.model = model

    # ── Read ──────────────────────────────────────────

    def get_by_id(self, record_id: uuid.UUID) -> Optional[ModelType]:
        """Fetch a single record by primary key."""
        return self.db.get(self.model, record_id)

    def list_all(
        self, *, limit: int = 100, offset: int = 0
    ) -> List[ModelType]:
        """Return a paginated list of records."""
        stmt = select(self.model).limit(limit).offset(offset)
        return list(self.db.scalars(stmt).all())

    # ── Create ────────────────────────────────────────

    def create(self, entity: ModelType) -> ModelType:
        """Persist a new entity and return it with server defaults."""
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity

    # ── Update ────────────────────────────────────────

    def save(self, entity: ModelType) -> ModelType:
        """Flush changes on an already-tracked entity."""
        self.db.commit()
        self.db.refresh(entity)
        return entity

    # ── Delete ────────────────────────────────────────

    def delete(self, entity: ModelType) -> None:
        """Remove an entity from the database."""
        self.db.delete(entity)
        self.db.commit()

    def delete_by_id(self, record_id: uuid.UUID) -> bool:
        """Delete by primary key. Returns True if a row was found."""
        entity = self.get_by_id(record_id)
        if entity:
            self.delete(entity)
            return True
        return False
