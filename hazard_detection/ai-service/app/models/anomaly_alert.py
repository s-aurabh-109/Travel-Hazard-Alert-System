"""
AnomalyAlert ORM model.

Stores alerts generated when an anomaly is detected
(e.g. GPS spoofing, prolonged inactivity, danger zone entry).
Linked to the RiskRecord that triggered the alert.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base
from app.core.enums.alert_severity import AlertSeverity
from app.core.enums.alert_status import AlertStatus


class AnomalyAlert(Base):
    __tablename__ = "anomaly_alert"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    risk_record_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("risk_record.id"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[AlertSeverity] = mapped_column(
        SQLEnum(AlertSeverity), nullable=False
    )
    status: Mapped[AlertStatus] = mapped_column(
        SQLEnum(AlertStatus), nullable=False, default=AlertStatus.ACTIVE
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ── Relationships ─────────────────────────────────
    risk_record = relationship(
        "RiskRecord", back_populates="anomaly_alerts"
    )

    def __repr__(self) -> str:
        return (
            f"<AnomalyAlert title='{self.title}' "
            f"severity={self.severity} status={self.status}>"
        )
