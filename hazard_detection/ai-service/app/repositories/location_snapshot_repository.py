"""
Repository for LocationSnapshot persistence.

Provides domain-specific queries on top of BaseRepository CRUD.
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.repositories.base_repository import BaseRepository
from app.models.location_snapshot import LocationSnapshot


class LocationSnapshotRepository(BaseRepository[LocationSnapshot]):
    def __init__(self, db: Session):
        super().__init__(db=db, model=LocationSnapshot)

    # ── Domain queries ────────────────────────────────

    def get_latest_snapshot(
        self, tourist_id: str
    ) -> Optional[LocationSnapshot]:
        """Return the most recent snapshot for a tourist."""
        stmt = (
            select(LocationSnapshot)
            .where(LocationSnapshot.tourist_id == tourist_id)
            .order_by(LocationSnapshot.captured_at.desc())
            .limit(1)
        )
        return self.db.scalars(stmt).first()

    def get_snapshots_by_tourist(
        self,
        tourist_id: str,
        *,
        limit: int = 50,
    ) -> List[LocationSnapshot]:
        """Return recent snapshots for a tourist, newest first."""
        stmt = (
            select(LocationSnapshot)
            .where(LocationSnapshot.tourist_id == tourist_id)
            .order_by(LocationSnapshot.captured_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get_recent_snapshots(
        self,
        tourist_id: str,
        *,
        hours: int = 24,
    ) -> List[LocationSnapshot]:
        """Return snapshots within the last N hours for a tourist."""
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        stmt = (
            select(LocationSnapshot)
            .where(
                LocationSnapshot.tourist_id == tourist_id,
                LocationSnapshot.captured_at >= cutoff,
            )
            .order_by(LocationSnapshot.captured_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def get_all_recent(
        self, *, hours: int = 24
    ) -> List[LocationSnapshot]:
        """Return all snapshots across tourists within the last N hours."""
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        stmt = (
            select(LocationSnapshot)
            .where(LocationSnapshot.captured_at >= cutoff)
            .order_by(LocationSnapshot.captured_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def create_snapshot(
        self,
        tourist_id: str,
        latitude: float,
        longitude: float,
        snapshot_source: str = "GPS",
    ) -> LocationSnapshot:
        """Create and persist a new location snapshot."""
        snapshot = LocationSnapshot(
            tourist_id=tourist_id,
            latitude=latitude,
            longitude=longitude,
            snapshot_source=snapshot_source,
        )
        return self.create(snapshot)

    def count_by_tourist(self, tourist_id: str) -> int:
        """Return total snapshot count for a tourist."""
        stmt = (
            select(func.count())
            .select_from(LocationSnapshot)
            .where(LocationSnapshot.tourist_id == tourist_id)
        )
        return self.db.scalar(stmt) or 0
