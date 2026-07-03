from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)

from app.core.enums import (
    HazardType,
    RiskLevel,
)


class AIResult(BaseModel):
    """
    Represents the prediction produced
    by an individual hazard model.
    """

    hazard_type: HazardType = Field(
        ...,
        description="Hazard analyzed by the AI model.",
    )

    risk_level: RiskLevel = Field(
        ...,
        description="Predicted qualitative risk level.",
    )

    risk_score: float = Field(
        ...,
        ge=0,
        le=1,
        description="Normalized risk score.",
    )

    confidence: float = Field(
        ...,
        ge=0,
        le=1,
        description="Confidence of the prediction.",
    )

    explanation: str = Field(
        ...,
        min_length=1,
        description="Human-readable explanation.",
    )

    model_version: str = Field(
        default="v1.0",
        description="Version of the AI model.",
    )

    model_config = ConfigDict(
        from_attributes=True,
    )