"""
RiskRecord ORM model.

Stores the result of a single hazard risk analysis (earthquake,
flood, landslide, etc.) tied to a specific LocationSnapshot.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Float, Text, DateTime, ForeignKey, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base
from app.core.enums.hazard import HazardType
from app.core.enums.risk import RiskLevel


class RiskRecord(Base):
    __tablename__ = "risk_record"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    snapshot_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("location_snapshot.id"),
        nullable=False,
        index=True,
    )
    hazard_type: Mapped[HazardType] = mapped_column(
        SQLEnum(HazardType), nullable=False
    )
    risk_level: Mapped[RiskLevel] = mapped_column(
        SQLEnum(RiskLevel), nullable=False
    )
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    model_version: Mapped[str] = mapped_column(
        String(20), nullable=False, default="v1.0"
    )
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    predicted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────
    snapshot = relationship(
        "LocationSnapshot", back_populates="risk_records"
    )
    anomaly_alerts = relationship(
        "AnomalyAlert", back_populates="risk_record", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return (
            f"<RiskRecord hazard={self.hazard_type} "
            f"level={self.risk_level} score={self.risk_score}>"
        )
