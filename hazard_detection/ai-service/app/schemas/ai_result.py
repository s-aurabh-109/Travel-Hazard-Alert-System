"""
Generic AI analysis result schema.

Returned by individual hazard services (earthquake, flood, etc.)
and consumed by the RiskClassificationService to build a
composite risk assessment.
"""

from typing import Optional

from pydantic import BaseModel, Field

from app.core.enums.hazard import HazardType
from app.core.enums.risk import RiskLevel


class AIResult(BaseModel):
    """Result of a single hazard analysis."""

    hazard_type: HazardType = Field(..., description="Type of hazard analysed.")
    risk_level: RiskLevel = Field(..., description="Predicted risk level.")
    risk_score: float = Field(
        ..., ge=0.0, le=1.0, description="Normalised risk score (0–1)."
    )
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Prediction confidence (0–1)."
    )
    explanation: str = Field(
        ..., description="Human-readable explanation of the prediction."
    )
    model_version: Optional[str] = Field(
        default="v1.0", description="Version of the model/rules used."
    )
