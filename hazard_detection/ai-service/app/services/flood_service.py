from datetime import datetime, timezone

from app.core.enums import HazardType, RiskLevel
from app.schemas.ai_result import AIResult
from app.utils.geo_utils import haversine_distance


class FloodService:
    """Performs flood risk analysis with seasonal monsoon adjustments."""

    FLOOD_ZONES = [
        (26.18, 91.75, 150, 0.90, "Brahmaputra Basin Assam"),
        (25.85, 86.60, 120, 0.85, "Kosi River Belt Bihar"),
        (19.08, 72.88, 40, 0.70, "Mumbai Coastal"),
        (9.93, 76.26, 60, 0.65, "Kerala Backwaters"),
        (16.53, 81.78, 80, 0.75, "Godavari Delta AP"),
        (22.57, 88.36, 50, 0.72, "Kolkata Hooghly Basin"),
        (25.43, 81.85, 100, 0.78, "Ganges Plains UP"),
        (21.17, 72.83, 40, 0.68, "Surat Gujarat Coast"),
        (10.85, 76.27, 70, 0.70, "Western Ghats Runoff"),
        (20.30, 85.82, 90, 0.73, "Mahanadi Basin Odisha"),
    ]

    def analyze(self, latitude: float, longitude: float) -> AIResult:
        month = datetime.now(timezone.utc).month
        if month in (6, 7, 8, 9):
            season_multiplier = 1.4
            season_note = "Active monsoon season — elevated flood risk."
        elif month in (10, 11):
            season_multiplier = 1.1
            season_note = "Post-monsoon period — residual flood risk."
        else:
            season_multiplier = 0.7
            season_note = "Dry season — reduced flood risk."

        closest_zone = None
        closest_distance = float("inf")
        zone_risk = 0.10

        for lat, lon, radius, risk_factor, name in self.FLOOD_ZONES:
            distance = haversine_distance(latitude, longitude, lat, lon)
            if distance < radius and distance < closest_distance:
                closest_distance = distance
                closest_zone = name
                zone_risk = risk_factor
            elif distance < radius * 2 and closest_zone is None:
                closest_zone = name
                closest_distance = distance
                zone_risk = risk_factor * 0.4

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
            explanation = f"Location is outside known flood zones. {season_note}"

        confidence = round(min(0.98, max(0.5, 1.0 - closest_distance / 300)), 2) if closest_zone else 0.85

        return AIResult(
            hazard_type=HazardType.FLOOD,
            risk_level=risk_level,
            risk_score=round(risk_score, 2),
            confidence=confidence,
            explanation=explanation,
            model_version="v1.0",
        )
