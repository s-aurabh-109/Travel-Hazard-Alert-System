from app.core.enums import (
    HazardType,
    RiskLevel,
)

from app.schemas import AIResult


class LandslideService:
    """
    Performs landslide risk analysis.

    Placeholder implementation.
    """

    def analyze(
        self,
        latitude: float,
        longitude: float,
    ) -> AIResult:

        return AIResult(
            hazard_type=HazardType.LANDSLIDE,
            risk_level=RiskLevel.LOW,
            risk_score=0.10,
            confidence=0.94,
            explanation=(
                "Placeholder prediction. "
                "Landslide model is not yet integrated."
            ),
            model_version="v1.0",
        )