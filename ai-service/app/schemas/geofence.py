import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

from app.core.enums.hazard import HazardType
from app.core.enums.alert_severity import AlertSeverity

class GeofenceCheckRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude of the location", examples=[34.0522])
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude of the location", examples=[-118.2437])

class NearbyZone(BaseModel):
    zone_id: uuid.UUID = Field(..., description="Unique ID of the zone")
    name: str = Field(..., description="Name of the zone")
    hazard_type: HazardType = Field(..., description="Type of hazard")
    severity: AlertSeverity = Field(..., description="Severity of the hazard")
    distance_km: float = Field(..., description="Distance to the zone in km")
    status: str = Field(..., description="Status of the user in relation to the zone (INSIDE or NEARBY)")

class GeofenceCheckResponse(BaseModel):
    classification: str = Field(..., description="General safety classification")
    overall_risk: str = Field(..., description="Overall risk level")
    nearby_zones: List[NearbyZone] = Field(default_factory=list, description="List of nearby danger zones")
    checked_at: datetime = Field(..., description="Timestamp of the check")

class DangerZoneCreate(BaseModel):
    name: str = Field(..., description="Name of the danger zone")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude of the zone center")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude of the zone center")
    radius_km: float = Field(default=10.0, description="Radius of the danger zone in kilometers")
    hazard_type: HazardType = Field(..., description="Type of hazard")
    severity: AlertSeverity = Field(..., description="Severity of the hazard")
    description: Optional[str] = Field(None, description="Optional description of the danger zone")

class DangerZoneRead(DangerZoneCreate):
    id: uuid.UUID = Field(..., description="Unique identifier for the danger zone")
    is_active: bool = Field(..., description="Whether the zone is currently active")
    created_at: datetime = Field(..., description="Timestamp when the zone was created")
    
    model_config = ConfigDict(from_attributes=True)
