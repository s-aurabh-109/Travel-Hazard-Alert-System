"""Pydantic schemas for risk classification request/response."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import HazardType, RiskLevel


class HazardDetail(BaseModel):
    hazard_type: HazardType = Field(..., description="Type of natural hazard.")
    risk_level: RiskLevel = Field(..., description="Predicted risk level.")
    risk_score: float = Field(..., ge=0, le=1, description="Normalized risk score.")
    confidence: float = Field(..., ge=0, le=1, description="Prediction confidence.")
    explanation: str = Field(..., description="Human-readable explanation.")


class RiskClassificationRequest(BaseModel):
    tourist_id: str = Field(..., min_length=1, max_length=100, description="Tourist identifier.", examples=["tourist_001"])
    latitude: float = Field(..., ge=-90, le=90, description="Latitude.", examples=[28.6139])
    longitude: float = Field(..., ge=-180, le=180, description="Longitude.", examples=[77.2090])


class RiskClassificationResponse(BaseModel):
    tourist_id: str
    composite_score: float = Field(..., ge=0, le=1, description="Weighted composite risk score.")
    composite_risk_level: str = Field(..., description="Overall risk level.", examples=["MEDIUM"])
    dominant_hazard: HazardType = Field(..., description="Hazard with highest individual score.")
    hazards: list[HazardDetail] = Field(..., description="Breakdown by hazard type.")
    classified_at: datetime
