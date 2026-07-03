from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.models import LocationSnapshot

from .base_repository import BaseRepository


class LocationSnapshotRepository(
    BaseRepository[LocationSnapshot]
):
    """
    Repository responsible for all database operations
    related to LocationSnapshot.
    """

    def __init__(self, db: Session):
        super().__init__(
            db=db,
            model=LocationSnapshot,
        )

    # --------------------------------------------------
    # CREATE
    # --------------------------------------------------

    def create_snapshot(
        self,
        tourist_id: str,
        latitude: float,
        longitude: float,
        snapshot_source: str = "GPS",
    ) -> LocationSnapshot:
        """
        Creates and stores a new LocationSnapshot.
        """

        snapshot = LocationSnapshot(
            tourist_id=tourist_id,
            latitude=latitude,
            longitude=longitude,
            snapshot_source=snapshot_source,
        )

        self.db.add(snapshot)
        self.commit()
        self.refresh(snapshot)

        return snapshot

    # --------------------------------------------------
    # READ
    # --------------------------------------------------

    def get_snapshots_by_tourist(
        self,
        tourist_id: str,
    ) -> list[LocationSnapshot]:
        """
        Returns every snapshot belonging
        to one tourist.
        """

        stmt = (
            select(LocationSnapshot)
            .where(
                LocationSnapshot.tourist_id == tourist_id
            )
            .order_by(
                LocationSnapshot.captured_at.desc()
            )
        )

        return list(
            self.db.scalars(stmt).all()
        )

    def get_latest_snapshot(
        self,
        tourist_id: str,
    ) -> LocationSnapshot | None:
        """
        Returns the most recent snapshot
        of a tourist.
        """

        stmt = (
            select(LocationSnapshot)
            .where(
                LocationSnapshot.tourist_id == tourist_id
            )
            .order_by(
                LocationSnapshot.captured_at.desc()
            )
            .limit(1)
        )

        return self.db.scalar(stmt)

    def list_snapshots(
        self,
        limit: int = 100,
        offset: int = 0,
    ) -> list[LocationSnapshot]:
        """
        Returns paginated snapshots.
        """

        stmt = (
            select(LocationSnapshot)
            .order_by(
                LocationSnapshot.captured_at.desc()
            )
            .offset(offset)
            .limit(limit)
        )

        return list(
            self.db.scalars(stmt).all()
        )
