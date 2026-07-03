from app.core.enums import (
    HazardType,
    RiskLevel,
)

from app.schemas import AIResult


class EarthquakeService:
    """
    Performs earthquake risk analysis.

    This is currently a placeholder implementation.
    A real ML model will replace this later.
    """

    def analyze(
        self,
        latitude: float,
        longitude: float,
    ) -> AIResult:

        return AIResult(
            hazard_type=HazardType.EARTHQUAKE,
            risk_level=RiskLevel.LOW,
            risk_score=0.20,
            confidence=0.95,
            explanation=(
                "Placeholder prediction. "
                "Earthquake model is not yet integrated."
            ),
            model_version="v1.0",
        )