from datetime import datetime, timezone

from app.core.enums import HazardType, RiskLevel
from app.schemas.ai_result import AIResult
from app.utils.geo_utils import haversine_distance


class LandslideService:
    """Performs landslide risk analysis using terrain and seasonal data."""

    LANDSLIDE_ZONES = [
        (30.33, 78.06, 80, 0.88, "Uttarakhand Hills"),
        (31.58, 78.17, 60, 0.85, "Himachal Kinnaur"),
        (10.85, 76.27, 100, 0.70, "Western Ghats Kerala"),
        (27.04, 88.26, 50, 0.75, "Darjeeling Hills"),
        (27.33, 88.62, 60, 0.80, "Sikkim"),
        (25.57, 91.88, 70, 0.72, "Meghalaya Hills"),
        (26.87, 93.95, 50, 0.68, "Nagaland Hills"),
        (34.15, 77.58, 80, 0.82, "Ladakh"),
        (32.22, 76.32, 40, 0.78, "Dharamshala HP"),
        (30.08, 78.30, 50, 0.85, "Rishikesh-Badrinath Corridor"),
    ]

    def analyze(self, latitude: float, longitude: float) -> AIResult:
        month = datetime.now(timezone.utc).month
        if month in (6, 7, 8, 9):
            season_multiplier = 1.4
            season_note = "Monsoon season — heavy rainfall triggers landslides."
        elif month in (10, 11):
            season_multiplier = 1.1
            season_note = "Post-monsoon — saturated soil increases landslide risk."
        else:
            season_multiplier = 0.6
            season_note = "Dry season — lower landslide probability."

        himalayan_boost = 0.0
        if latitude > 28 and 72 < longitude < 98:
            himalayan_boost = 0.05

        closest_zone = None
        closest_distance = float("inf")
        zone_risk = 0.08

        for lat, lon, radius, risk_factor, name in self.LANDSLIDE_ZONES:
            distance = haversine_distance(latitude, longitude, lat, lon)
            if distance < radius and distance < closest_distance:
                closest_distance = distance
                closest_zone = name
                zone_risk = risk_factor

        risk_score = min(1.0, (zone_risk + himalayan_boost) * season_multiplier)

        if risk_score >= 0.70:
            risk_level = RiskLevel.HIGH
        elif risk_score >= 0.40:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.LOW

        if closest_zone:
            explanation = f"Near {closest_zone} ({closest_distance:.1f} km). {season_note}"
        else:
            explanation = f"Location is outside known landslide zones. {season_note}"

        confidence = round(min(0.97, max(0.5, 1.0 - closest_distance / 200)), 2) if closest_zone else 0.82

        return AIResult(
            hazard_type=HazardType.LANDSLIDE,
            risk_level=risk_level,
            risk_score=round(risk_score, 2),
            confidence=confidence,
            explanation=explanation,
            model_version="v1.0",
        )
