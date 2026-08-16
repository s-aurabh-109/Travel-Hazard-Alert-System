from pydantic import BaseModel, Field
from datetime import datetime
from typing import List

class SafetyFactors(BaseModel):
    time_of_day_score: float = Field(..., ge=0, le=100, description="Score based on time of day (0-100)")
    geofence_score: float = Field(..., ge=0, le=100, description="Score based on geofence proximity (0-100)")
    route_deviation_score: float = Field(..., ge=0, le=100, description="Score based on route deviation (0-100)")
    sos_history_score: float = Field(..., ge=0, le=100, description="Score based on SOS history (0-100)")
    inactivity_score: float = Field(..., ge=0, le=100, description="Score based on inactivity (0-100)")

class SafetyScoreRequest(BaseModel):
    tourist_id: str = Field(..., min_length=1, max_length=100, description="Tourist ID")
    latitude: float = Field(..., ge=-90, le=90, description="Latitude of the tourist")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude of the tourist")
    geofence_status: str = Field("SAFE", description="Current geofence classification status")
    is_on_expected_route: bool = Field(True, description="Whether the tourist is on their expected route")
    recent_sos_count: int = Field(0, ge=0, description="Number of recent SOS alerts")
    last_activity_minutes_ago: int = Field(0, ge=0, description="Minutes since last detected activity")

class SafetyScoreResponse(BaseModel):
    tourist_id: str = Field(..., description="Tourist ID")
    overall_score: float = Field(..., ge=0, le=100, description="Overall computed safety score (0-100)")
    risk_label: str = Field(..., description="Risk label (e.g., LOW, MEDIUM, HIGH, CRITICAL)")
    factors: SafetyFactors = Field(..., description="Breakdown of individual safety factors")
    recommendations: List[str] = Field(..., description="List of actionable recommendations based on score")
    computed_at: datetime = Field(..., description="Timestamp when the score was computed")
