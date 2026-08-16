"""Pydantic schemas for LocationSnapshot CRUD operations."""

import uuid
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class LocationSnapshotBase(BaseModel):
    """Fields shared by create and read schemas."""
    tourist_id: str = Field(
        ..., min_length=1, max_length=100, description="Tourist identifier"
    )
    latitude: float = Field(
        ..., ge=-90.0, le=90.0, description="Latitude", examples=[28.6139]
    )
    longitude: float = Field(
        ..., ge=-180.0, le=180.0, description="Longitude", examples=[77.2090]
    )
    snapshot_source: str = Field(
        default="GPS", max_length=30, description="Source of the reading"
    )


class LocationSnapshotCreate(LocationSnapshotBase):
    """Schema for creating a new snapshot (no id or timestamp)."""
    pass


class LocationSnapshotRead(LocationSnapshotBase):
    """Schema returned from the API (includes server-generated fields)."""
    id: uuid.UUID
    captured_at: datetime

    model_config = ConfigDict(from_attributes=True)
