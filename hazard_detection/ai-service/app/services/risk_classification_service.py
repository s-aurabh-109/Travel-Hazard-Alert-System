from datetime import datetime, timezone

from app.core.enums import HazardType
from app.services.earthquake_service import EarthquakeService
from app.services.flood_service import FloodService
from app.services.landslide_service import LandslideService
from app.services.cyclone_service import CycloneService
from app.services.drought_service import DroughtService


class RiskClassificationService:
    """Combines all hazard services into a composite risk classification."""

    WEIGHTS = {
        HazardType.EARTHQUAKE: 0.25,
        HazardType.FLOOD: 0.25,
        HazardType.LANDSLIDE: 0.20,
        HazardType.CYCLONE: 0.15,
        HazardType.DROUGHT: 0.15,
    }

    def __init__(
        self,
        earthquake_service: EarthquakeService,
        flood_service: FloodService,
        landslide_service: LandslideService,
        cyclone_service: CycloneService,
        drought_service: DroughtService,
    ):
        self.earthquake_service = earthquake_service
        self.flood_service = flood_service
        self.landslide_service = landslide_service
        self.cyclone_service = cyclone_service
        self.drought_service = drought_service

    def classify_risk(self, tourist_id: str, latitude: float, longitude: float) -> dict:
        predictions = [
            self.earthquake_service.analyze(latitude, longitude),
            self.flood_service.analyze(latitude, longitude),
            self.landslide_service.analyze(latitude, longitude),
            self.cyclone_service.analyze(latitude, longitude),
            self.drought_service.analyze(latitude, longitude),
        ]

        composite_score = sum(
            p.risk_score * self.WEIGHTS[p.hazard_type] for p in predictions
        )
        composite_score = round(composite_score, 4)

        if composite_score >= 0.75:
            composite_level = "CRITICAL"
        elif composite_score >= 0.50:
            composite_level = "HIGH"
        elif composite_score >= 0.25:
            composite_level = "MEDIUM"
        else:
            composite_level = "LOW"

        dominant = max(predictions, key=lambda p: p.risk_score)

        hazards = [
            {
                "hazard_type": p.hazard_type,
                "risk_level": p.risk_level,
                "risk_score": p.risk_score,
                "confidence": p.confidence,
                "explanation": p.explanation,
            }
            for p in predictions
        ]

        return {
            "tourist_id": tourist_id,
            "composite_score": composite_score,
            "composite_risk_level": composite_level,
            "dominant_hazard": dominant.hazard_type,
            "hazards": hazards,
            "classified_at": datetime.now(timezone.utc),
        }
