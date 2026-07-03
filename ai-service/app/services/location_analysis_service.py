from app.repositories import (
    LocationSnapshotRepository,
    RiskRecordRepository,
)

from app.schemas import (
    LocationSnapshotCreate,
    LocationSnapshotRead,
)

from app.services.earthquake_service import EarthquakeService
from app.services.flood_service import FloodService
from app.services.landslide_service import LandslideService


class LocationAnalysisService:
    """
    Coordinates the AI workflow
    for tourist location analysis.
    """

    def __init__(
        self,
        location_repository: LocationSnapshotRepository,
        risk_repository: RiskRecordRepository,
        earthquake_service: EarthquakeService,
        flood_service: FloodService,
        landslide_service: LandslideService,
    ):
        self.location_repository = location_repository
        self.risk_repository = risk_repository

        self.earthquake_service = earthquake_service
        self.flood_service = flood_service
        self.landslide_service = landslide_service

    def analyze_location(
        self,
        snapshot: LocationSnapshotCreate,
    ) -> LocationSnapshotRead:

        # --------------------------------------
        # 1. Save Location Snapshot
        # --------------------------------------

        saved_snapshot = (
            self.location_repository.create_snapshot(
                tourist_id=snapshot.tourist_id,
                latitude=snapshot.latitude,
                longitude=snapshot.longitude,
                snapshot_source=snapshot.snapshot_source,
            )
        )

        # --------------------------------------
        # 2. Run Earthquake Analysis
        # --------------------------------------

        predictions = [
            self.earthquake_service.analyze(
                snapshot.latitude,
                snapshot.longitude,
            ),
            self.flood_service.analyze(
                snapshot.latitude,
                snapshot.longitude,
            ),
            self.landslide_service.analyze(
                snapshot.latitude,
                snapshot.longitude,
            ),
        ]

        # --------------------------------------
        # 3. Save Risk Record
        # --------------------------------------

        for prediction in predictions:

            self.risk_repository.create_risk_record(
                snapshot_id=saved_snapshot.id,
                hazard_type=prediction.hazard_type,
                risk_level=prediction.risk_level,
                risk_score=prediction.risk_score,
                confidence=prediction.confidence,
                model_version=prediction.model_version,
                explanation=prediction.explanation,
            )
        # --------------------------------------
        # 4. Return Snapshot
        # --------------------------------------

        return LocationSnapshotRead.model_validate(
            saved_snapshot
        )