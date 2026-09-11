"""Pydantic schemas for AnomalyAlert CRUD operations."""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

from app.core.enums.alert_severity import AlertSeverity
from app.core.enums.alert_status import AlertStatus


class AnomalyAlertBase(BaseModel):
    """Fields shared by create and read schemas."""
    risk_record_id: uuid.UUID = Field(
        ..., description="FK to the parent RiskRecord"
    )
    title: str = Field(
        ..., max_length=200, description="Short alert title"
    )
    message: str = Field(
        ..., description="Detailed alert message"
    )
    severity: AlertSeverity = Field(
        ..., description="Alert severity level"
    )


class AnomalyAlertCreate(AnomalyAlertBase):
    """Schema for creating a new alert."""
    status: AlertStatus = Field(
        default=AlertStatus.ACTIVE, description="Initial alert status"
    )


class AnomalyAlertRead(AnomalyAlertBase):
    """Schema returned from the API."""
    id: uuid.UUID
    status: AlertStatus
    created_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
