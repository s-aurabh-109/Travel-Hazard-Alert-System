from app.core.enums import (
    HazardType,
    RiskLevel,
)

from app.schemas import AIResult


class FloodService:
    """
    Performs flood risk analysis.

    Placeholder implementation.
    """

    def analyze(
        self,
        latitude: float,
        longitude: float,
    ) -> AIResult:

        return AIResult(
            hazard_type=HazardType.FLOOD,
            risk_level=RiskLevel.LOW,
            risk_score=0.15,
            confidence=0.96,
            explanation=(
                "Placeholder prediction. "
                "Flood model is not yet integrated."
            ),
            model_version="v1.0",
        )