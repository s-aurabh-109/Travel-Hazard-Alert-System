"""
LocationSnapshot ORM model.

Stores a point-in-time GPS reading for a tourist.
This is the foundational table — RiskRecords and AnomalyAlerts
are derived from snapshots.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Float, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class LocationSnapshot(Base):
    __tablename__ = "location_snapshot"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tourist_id: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    captured_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )
    snapshot_source: Mapped[str] = mapped_column(
        String(30), nullable=False, default="GPS"
    )

    # ── Relationships ─────────────────────────────────
    risk_records = relationship(
        "RiskRecord", back_populates="snapshot", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return (
            f"<LocationSnapshot tourist={self.tourist_id} "
            f"lat={self.latitude} lon={self.longitude}>"
        )
