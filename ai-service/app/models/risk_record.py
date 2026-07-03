import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum,
    Float,
    ForeignKey,
    String,
    Text,
    func,
    UUID,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db import Base
from app.core.enums import (
    HazardType,
    RiskLevel,
)


class RiskRecord(Base):
    """
    Stores the AI prediction generated from a Location Snapshot.

    A single Location Snapshot can produce multiple Risk Records
    (Earthquake, Flood, Cyclone, etc.).
    """

    __tablename__ = "risk_record"

    # -------------------------------
    # Primary Key
    # -------------------------------

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # -------------------------------
    # Foreign Key
    # -------------------------------

    snapshot_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("location_snapshot.id"),
        nullable=False,
        index=True,
    )

    # -------------------------------
    # AI Prediction
    # -------------------------------

    hazard_type: Mapped[HazardType] = mapped_column(
        Enum(HazardType),
        nullable=False,
    )

    risk_level: Mapped[RiskLevel] = mapped_column(
        Enum(RiskLevel),
        nullable=False,
    )

    risk_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    confidence: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    model_version: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="v1.0",
    )

    explanation: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    predicted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # -------------------------------
    # Relationships
    # -------------------------------

    snapshot: Mapped["LocationSnapshot"] = relationship(
        back_populates="risk_records",
    )

    alerts: Mapped[list["AnomalyAlert"]] = relationship(
        back_populates="risk_record",
        cascade="all, delete-orphan",
    )