"""Pydantic schemas for anomaly detection request/response."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field

from app.core.enums import AlertSeverity


class AnomalyType(str, Enum):
    INACTIVITY = "INACTIVITY"
    SUDDEN_DEVIATION = "SUDDEN_DEVIATION"
    DISAPPEARANCE = "DISAPPEARANCE"
    DANGER_ZONE_ENTRY = "DANGER_ZONE_ENTRY"
    SPEED_ANOMALY = "SPEED_ANOMALY"


class DetectedAnomaly(BaseModel):
    anomaly_type: AnomalyType = Field(..., description="Type of anomaly detected.")
    severity: AlertSeverity = Field(..., description="Severity of the anomaly.")
    title: str = Field(..., min_length=1, description="Short alert title.")
    message: str = Field(..., min_length=1, description="Detailed alert message.")
    details: dict = Field(default_factory=dict, description="Extra data about the anomaly.")


class AnomalyDetectionRequest(BaseModel):
    tourist_id: str = Field(..., min_length=1, max_length=100, description="Tourist identifier.", examples=["tourist_001"])
    latitude: float = Field(..., ge=-90, le=90, description="Latitude.", examples=[28.6139])
    longitude: float = Field(..., ge=-180, le=180, description="Longitude.", examples=[77.2090])
    geofence_status: str = Field(default="SAFE", description="Geofence classification.", examples=["SAFE"])


class AnomalyDetectionResponse(BaseModel):
    tourist_id: str
    anomalies_detected: int
    alerts: list[DetectedAnomaly]
    analyzed_at: datetime
