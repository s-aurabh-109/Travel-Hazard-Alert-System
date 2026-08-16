from datetime import datetime, timezone

from app.core.enums import HazardType, RiskLevel
from app.schemas.ai_result import AIResult
from app.utils.geo_utils import haversine_distance


class DroughtService:
    """Performs drought risk analysis for arid and semi-arid regions."""

    DROUGHT_ZONES = [
        (26.90, 70.90, 150, 0.82, "Thar Desert Rajasthan"),
        (23.24, 69.67, 100, 0.78, "Kutch Gujarat"),
        (15.35, 75.12, 80, 0.70, "North Karnataka"),
        (18.52, 73.85, 60, 0.65, "Marathwada Maharashtra"),
        (17.38, 78.49, 70, 0.60, "Telangana"),
        (15.83, 78.05, 80, 0.72, "Rayalaseema AP"),
        (11.13, 78.66, 60, 0.58, "Central Tamil Nadu"),
        (23.26, 77.41, 70, 0.55, "Bundelkhand MP"),
    ]

    def analyze(self, latitude: float, longitude: float) -> AIResult:
        month = datetime.now(timezone.utc).month
        if month in (3, 4, 5, 6):
            season_multiplier = 1.3
            season_note = "Summer season — heightened drought conditions."
        elif month in (7, 8, 9):
            season_multiplier = 0.5
            season_note = "Monsoon season — drought risk reduced by rainfall."
        else:
            season_multiplier = 0.8
            season_note = "Post-monsoon/winter — moderate drought risk."

        closest_zone = None
        closest_distance = float("inf")
        zone_risk = 0.08

        for lat, lon, radius, risk_factor, name in self.DROUGHT_ZONES:
            distance = haversine_distance(latitude, longitude, lat, lon)
            if distance < radius and distance < closest_distance:
                closest_distance = distance
                closest_zone = name
                zone_risk = risk_factor

        risk_score = min(1.0, zone_risk * season_multiplier)

        if risk_score >= 0.70:
            risk_level = RiskLevel.HIGH
        elif risk_score >= 0.40:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.LOW

        if closest_zone:
            explanation = f"Inside {closest_zone} ({closest_distance:.1f} km from center). {season_note}"
        else:
            explanation = f"Location is outside known drought-prone regions. {season_note}"

        confidence = round(min(0.95, max(0.5, 1.0 - closest_distance / 250)), 2) if closest_zone else 0.78

        return AIResult(
            hazard_type=HazardType.DROUGHT,
            risk_level=risk_level,
            risk_score=round(risk_score, 2),
            confidence=confidence,
            explanation=explanation,
            model_version="v1.0",
        )
