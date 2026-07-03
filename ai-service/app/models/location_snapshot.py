import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, String, func, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class LocationSnapshot(Base):
    """
    Stores an immutable snapshot of a tourist's location
    at the moment an AI analysis is triggered.

    This table stores historical evidence only.
    It is NOT the tourist's live location.
    """

    __tablename__ = "location_snapshot"

    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # External reference from the main backend
    tourist_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    # GPS Coordinates
    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    # Time when the location was observed
    captured_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )

    # Origin of this snapshot
    snapshot_source: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="GPS",
    )

    risk_records: Mapped[list["RiskRecord"]] = relationship(
        back_populates="snapshot",
    )
