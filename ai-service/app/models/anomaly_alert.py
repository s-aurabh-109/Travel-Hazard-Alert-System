import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum,
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
    AlertSeverity,
    AlertStatus,
)


class AnomalyAlert(Base):
    """
    Represents an alert generated from an AI RiskRecord.

    A RiskRecord may generate zero, one, or multiple alerts.
    """

    __tablename__ = "anomaly_alert"

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

    risk_record_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("risk_record.id"),
        nullable=False,
        index=True,
    )

    # -------------------------------
    # Alert Information
    # -------------------------------

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    severity: Mapped[AlertSeverity] = mapped_column(
        Enum(AlertSeverity),
        nullable=False,
    )

    status: Mapped[AlertStatus] = mapped_column(
        Enum(AlertStatus),
        nullable=False,
        default=AlertStatus.ACTIVE,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # -------------------------------
    # Relationship
    # -------------------------------

    risk_record: Mapped["RiskRecord"] = relationship(
        back_populates="alerts",
    )