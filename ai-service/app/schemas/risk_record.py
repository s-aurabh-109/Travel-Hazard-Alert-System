"""Pydantic schemas for RiskRecord CRUD operations."""

import uuid
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

from app.core.enums.hazard import HazardType
from app.core.enums.risk import RiskLevel


class RiskRecordBase(BaseModel):
    """Fields shared by create and read schemas."""
    snapshot_id: uuid.UUID = Field(
        ..., description="FK to the parent LocationSnapshot"
    )
    hazard_type: HazardType = Field(
        ..., description="Type of natural hazard assessed"
    )
    risk_level: RiskLevel = Field(
        ..., description="Computed risk level"
    )
    risk_score: float = Field(
        ..., ge=0.0, le=1.0, description="Risk score (0–1)"
    )
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Model confidence (0–1)"
    )
    model_version: str = Field(
        default="v1.0", max_length=20, description="Version of the model/rules used"
    )
    explanation: str = Field(
        ..., description="Human-readable explanation of the risk assessment"
    )


class RiskRecordCreate(RiskRecordBase):
    """Schema for creating a new risk record."""
    pass


class RiskRecordRead(RiskRecordBase):
    """Schema returned from the API."""
    id: uuid.UUID
    predicted_at: datetime

    model_config = ConfigDict(from_attributes=True)
