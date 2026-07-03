from datetime import datetime
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)

from app.core.enums import (
    AlertSeverity,
    AlertStatus,
)


# ==================================================
# Base Schema
# ==================================================

class AnomalyAlertBase(BaseModel):
    """
    Common fields shared by multiple
    AnomalyAlert schemas.
    """

    risk_record_id: UUID = Field(
        ...,
        description="RiskRecord associated with this alert.",
    )

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Short title of the alert.",
        examples=["High Earthquake Risk"],
    )

    message: str = Field(
        ...,
        min_length=1,
        description="Detailed alert message.",
        examples=[
            "The tourist is currently located inside a high seismic hazard zone."
        ],
    )

    severity: AlertSeverity = Field(
        ...,
        description="Severity level of the alert.",
        examples=["HIGH"],
    )

    status: AlertStatus = Field(
        default=AlertStatus.ACTIVE,
        description="Current lifecycle status of the alert.",
        examples=["ACTIVE"],
    )


# ==================================================
# Create Schema
# ==================================================

class AnomalyAlertCreate(AnomalyAlertBase):
    """
    Request schema used when creating
    a new AnomalyAlert.
    """

    pass


# ==================================================
# Read Schema
# ==================================================

class AnomalyAlertRead(AnomalyAlertBase):
    """
    Response schema returned after
    reading an AnomalyAlert.
    """

    id: UUID

    created_at: datetime

    resolved_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )