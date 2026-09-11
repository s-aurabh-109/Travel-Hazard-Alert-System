from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.safety_score import SafetyScoreRequest, SafetyScoreResponse
from app.services.safety_score_service import SafetyScoreService
from app.repositories.location_snapshot_repository import LocationSnapshotRepository

router = APIRouter(prefix="/safety-score", tags=["Safety Score"])


@router.post("/compute", response_model=SafetyScoreResponse)
def compute_score(
    request: SafetyScoreRequest,
    db: Session = Depends(get_db),
):
    service = SafetyScoreService()
    return service.compute_safety_score(
        tourist_id=request.tourist_id,
        latitude=request.latitude,
        longitude=request.longitude,
        geofence_classification=request.geofence_status,
        is_on_expected_route=request.is_on_expected_route,
        recent_sos_count=request.recent_sos_count,
        last_activity_minutes_ago=request.last_activity_minutes_ago,
    )


@router.get("/{tourist_id}", response_model=SafetyScoreResponse)
def get_score(tourist_id: str, db: Session = Depends(get_db)):
    location_repo = LocationSnapshotRepository(db=db)
    latest_snapshot = location_repo.get_latest_snapshot(tourist_id)
    if not latest_snapshot:
        raise HTTPException(
            status_code=404,
            detail="No location snapshot found for this tourist.",
        )

    service = SafetyScoreService()
    return service.compute_safety_score(
        tourist_id=tourist_id,
        latitude=latest_snapshot.latitude,
        longitude=latest_snapshot.longitude,
    )
