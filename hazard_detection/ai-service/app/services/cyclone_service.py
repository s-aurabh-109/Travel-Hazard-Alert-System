from datetime import datetime, timezone

from app.core.enums import HazardType, RiskLevel
from app.schemas.ai_result import AIResult
from app.utils.geo_utils import haversine_distance


class CycloneService:
    """Performs cyclone risk analysis for coastal regions."""

    CYCLONE_ZONES = [
        (13.08, 80.27, 80, 0.75, "Tamil Nadu Coast", "east"),
        (16.53, 81.78, 100, 0.80, "Andhra Pradesh Coast", "east"),
        (20.30, 85.82, 90, 0.82, "Odisha Coast", "east"),
        (22.57, 88.36, 60, 0.70, "West Bengal Coast", "east"),
        (21.17, 72.83, 70, 0.72, "Gujarat Coast", "west"),
        (19.08, 72.88, 50, 0.65, "Mumbai Coast", "west"),
        (9.93, 76.26, 60, 0.68, "Kerala Coast", "west"),
        (15.40, 73.88, 40, 0.55, "Goa Coast", "west"),
        (11.67, 92.73, 80, 0.85, "Andaman & Nicobar", "east"),
        (8.52, 76.94, 50, 0.60, "Trivandrum Coast", "west"),
    ]

    def analyze(self, latitude: float, longitude: float) -> AIResult:
        month = datetime.now(timezone.utc).month

        closest_zone = None
        closest_distance = float("inf")
        zone_risk = 0.05
        coast_type = "none"

        for lat, lon, radius, risk_factor, name, coast in self.CYCLONE_ZONES:
            distance = haversine_distance(latitude, longitude, lat, lon)
            if distance < radius and distance < closest_distance:
                closest_distance = distance
                closest_zone = name
                zone_risk = risk_factor
                coast_type = coast

        if coast_type == "east" and month in (10, 11, 12):
            season_multiplier = 1.5
            season_note = "Peak Bay of Bengal cyclone season (Oct-Dec)."
        elif coast_type == "west" and month in (5, 6):
            season_multiplier = 1.3
            season_note = "Pre-monsoon Arabian Sea cyclone season (May-Jun)."
        elif month in (4, 5, 10, 11):
            season_multiplier = 1.1
            season_note = "Transitional cyclone season."
        else:
            season_multiplier = 0.5
            season_note = "Non-cyclone season — low probability."

        risk_score = min(1.0, zone_risk * season_multiplier)

        if risk_score >= 0.70:
            risk_level = RiskLevel.HIGH
        elif risk_score >= 0.40:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.LOW

        if closest_zone:
            explanation = f"Near {closest_zone} ({closest_distance:.1f} km). {season_note}"
        else:
            explanation = f"Location is inland, away from cyclone-prone coasts. {season_note}"

        confidence = round(min(0.96, max(0.5, 1.0 - closest_distance / 200)), 2) if closest_zone else 0.80

        return AIResult(
            hazard_type=HazardType.CYCLONE,
            risk_level=risk_level,
            risk_score=round(risk_score, 2),
            confidence=confidence,
            explanation=explanation,
            model_version="v1.0",
        )
