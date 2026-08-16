from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.schemas.anomaly_detection import AnomalyDetectionRequest, AnomalyDetectionResponse
from app.schemas.anomaly_alert import AnomalyAlertRead
from app.repositories.location_snapshot_repository import LocationSnapshotRepository
from app.repositories.anomaly_alert_repository import AnomalyAlertRepository
from app.repositories.risk_record_repository import RiskRecordRepository
from app.services.anomaly_detection_service import AnomalyDetectionService

router = APIRouter(prefix="/ai", tags=["Anomaly Detection"])


@router.post("/analyze", response_model=AnomalyDetectionResponse)
def analyze_anomaly(
    request: AnomalyDetectionRequest,
    db: Session = Depends(get_db),
):
    location_repo = LocationSnapshotRepository(db=db)
    alert_repo = AnomalyAlertRepository(db=db)
    risk_repo = RiskRecordRepository(db=db)
    service = AnomalyDetectionService(
        location_repository=location_repo,
        alert_repository=alert_repo,
        risk_repository=risk_repo,
    )
    return service.detect_anomalies(
        tourist_id=request.tourist_id,
        latitude=request.latitude,
        longitude=request.longitude,
        geofence_status=request.geofence_status,
    )


@router.get("/alerts/{tourist_id}", response_model=List[AnomalyAlertRead])
def get_alerts(tourist_id: str, db: Session = Depends(get_db)):
    alert_repo = AnomalyAlertRepository(db=db)
    return alert_repo.get_alerts_by_tourist(tourist_id)
