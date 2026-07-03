from datetime import datetime
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


# ==================================================
# Base Schema
# ==================================================

class LocationSnapshotBase(BaseModel):
    """
    Common fields shared by multiple
    LocationSnapshot schemas.
    """

    tourist_id: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Unique tourist identifier from the Backend Service.",
        examples=["tourist_001"],
    )

    latitude: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Latitude in decimal degrees.",
        examples=[28.6139],
    )

    longitude: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Longitude in decimal degrees.",
        examples=[77.2090],
    )

    snapshot_source: str = Field(
        default="GPS",
        max_length=30,
        description="Origin of the location snapshot.",
        examples=["GPS"],
    )


# ==================================================
# Create Schema
# ==================================================

class LocationSnapshotCreate(LocationSnapshotBase):
    """
    Request schema used when creating
    a new LocationSnapshot.
    """

    pass


# ==================================================
# Read Schema
# ==================================================

class LocationSnapshotRead(LocationSnapshotBase):
    """
    Response schema returned after
    reading a LocationSnapshot.
    """

    id: UUID

    captured_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )