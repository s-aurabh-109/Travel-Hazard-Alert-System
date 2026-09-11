from datetime import datetime, timezone

from app.core.enums import HazardType, RiskLevel
from app.schemas.ai_result import AIResult
from app.utils.geo_utils import haversine_distance


class EarthquakeService:
    """Performs earthquake risk analysis using Indian seismic zone data."""

    SEISMIC_ZONES = [
        (34.08, 74.79, 150, 5, "Kashmir Valley"),
        (26.14, 91.74, 200, 5, "North-East India"),
        (11.67, 92.73, 100, 5, "Andaman Islands"),
        (23.24, 69.67, 120, 5, "Kutch Gujarat"),
        (30.73, 79.07, 150, 5, "Uttarakhand Himalaya"),
        (28.61, 77.21, 80, 4, "Delhi NCR"),
        (25.60, 85.10, 100, 4, "Bihar"),
        (31.10, 77.17, 80, 4, "Shimla Himachal"),
        (19.08, 72.88, 60, 3, "Mumbai Region"),
        (22.57, 88.36, 60, 3, "Kolkata Region"),
        (13.08, 80.27, 80, 2, "Chennai Region"),
        (17.38, 78.49, 80, 2, "Hyderabad Region"),
        (12.97, 77.59, 80, 2, "Bangalore Region"),
    ]

    def analyze(self, latitude: float, longitude: float) -> AIResult:
        closest_zone = None
        closest_distance = float("inf")
        closest_level = 2

        for lat, lon, radius, level, name in self.SEISMIC_ZONES:
            distance = haversine_distance(latitude, longitude, lat, lon)
            if distance < radius and distance < closest_distance:
                closest_distance = distance
                closest_zone = name
                closest_level = level

        if closest_zone is None:
            return AIResult(
                hazard_type=HazardType.EARTHQUAKE,
                risk_level=RiskLevel.LOW,
                risk_score=0.10,
                confidence=0.90,
                explanation="Location is outside known seismic zones. Low earthquake risk.",
                model_version="v1.0",
            )

        if closest_level == 5:
            risk_score = 0.85
            risk_level = RiskLevel.HIGH
        elif closest_level == 4:
            risk_score = 0.60
            risk_level = RiskLevel.MEDIUM
        elif closest_level == 3:
            risk_score = 0.35
            risk_level = RiskLevel.LOW
        else:
            risk_score = 0.15
            risk_level = RiskLevel.LOW

        proximity_factor = max(0.5, 1.0 - (closest_distance / 200))
        confidence = round(min(0.99, proximity_factor * 0.95), 2)

        return AIResult(
            hazard_type=HazardType.EARTHQUAKE,
            risk_level=risk_level,
            risk_score=round(risk_score, 2),
            confidence=confidence,
            explanation=f"Location is inside {closest_zone} (Seismic Zone {closest_level}). Distance to zone center: {closest_distance:.1f} km.",
            model_version="v1.0",
        )
