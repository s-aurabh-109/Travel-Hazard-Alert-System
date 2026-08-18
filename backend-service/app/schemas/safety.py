"""Schemas for the unified safety overview endpoint."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SafetyOverviewRequest(BaseModel):
    """Request body for the safety overview endpoint."""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude")
    tourist_id: Optional[str] = Field(None, description="Optional tourist ID for personalized analysis")


class SafetyOverview(BaseModel):
    """Unified safety response combining all data sources."""

    # Location
    latitude: float
    longitude: float

    # Geofence (from ai-service)
    geofence: Optional[dict] = Field(None, description="Geofence check result")

    # Risk classification (from ai-service)
    risk: Optional[dict] = Field(None, description="Multi-hazard risk classification")

    # Safety score (from ai-service)
    safety_score: Optional[dict] = Field(None, description="Computed safety score")

    # Nearest emergency services (from backend local)
    nearest_hospitals: Optional[dict] = Field(None, description="Nearest hospitals from Overpass API")
    nearest_police_stations: Optional[dict] = Field(None, description="Nearest police stations from Overpass API")

    # Metadata
    timestamp: datetime
    data_sources: dict = Field(default_factory=dict, description="Status of each data source")
