from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.risk_classification import RiskClassificationRequest, RiskClassificationResponse
from app.services.earthquake_service import EarthquakeService
from app.services.flood_service import FloodService
from app.services.landslide_service import LandslideService
from app.services.cyclone_service import CycloneService
from app.services.drought_service import DroughtService
from app.services.risk_classification_service import RiskClassificationService
from app.repositories.location_snapshot_repository import LocationSnapshotRepository
from sqlalchemy import select
from app.models.location_snapshot import LocationSnapshot

router = APIRouter(prefix="/risk", tags=["Risk Classification"])


def get_risk_service() -> RiskClassificationService:
    return RiskClassificationService(
        earthquake_service=EarthquakeService(),
        flood_service=FloodService(),
        landslide_service=LandslideService(),
        cyclone_service=CycloneService(),
        drought_service=DroughtService(),
    )


@router.post("/classify", response_model=RiskClassificationResponse)
def classify_risk(
    request: RiskClassificationRequest,
    service: RiskClassificationService = Depends(get_risk_service),
):
    return service.classify_risk(
        tourist_id=request.tourist_id,
        latitude=request.latitude,
        longitude=request.longitude,
    )


@router.get("/level/{tourist_id}", response_model=RiskClassificationResponse)
def get_risk_level(
    tourist_id: str,
    db: Session = Depends(get_db),
    service: RiskClassificationService = Depends(get_risk_service),
):
    stmt = (
        select(LocationSnapshot)
        .where(LocationSnapshot.tourist_id == tourist_id)
        .order_by(LocationSnapshot.captured_at.desc())
        .limit(1)
    )
    snapshot = db.execute(stmt).scalars().first()

    if not snapshot:
        raise HTTPException(
            status_code=404,
            detail="Location snapshot not found for tourist",
        )

    return service.classify_risk(
        tourist_id=tourist_id,
        latitude=snapshot.latitude,
        longitude=snapshot.longitude,
    )
