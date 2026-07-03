from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db

from app.repositories import (
    LocationSnapshotRepository,
    RiskRecordRepository,
)

from app.schemas import (
    LocationSnapshotCreate,
    LocationSnapshotRead,
)

from app.services import (
    LocationAnalysisService,
    EarthquakeService,
    FloodService,
    LandslideService,
)

router = APIRouter(
    prefix="/test-db",
    tags=["Database Test"],
)


@router.post(
    "/snapshot",
    response_model=LocationSnapshotRead,
)
def create_snapshot(
    snapshot: LocationSnapshotCreate,
    db: Session = Depends(get_db),
):

    location_repository = LocationSnapshotRepository(db)

    risk_repository = RiskRecordRepository(db)

    earthquake_service = EarthquakeService()

    flood_service = FloodService()

    landslide_service = LandslideService()

    service = LocationAnalysisService(
        location_repository=location_repository,
        risk_repository=risk_repository,
        earthquake_service=earthquake_service,
        flood_service=flood_service,
        landslide_service=landslide_service,
    )

    return service.analyze_location(snapshot)