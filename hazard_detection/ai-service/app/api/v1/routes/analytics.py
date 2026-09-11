from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.repositories.location_snapshot_repository import LocationSnapshotRepository
from app.repositories.risk_record_repository import RiskRecordRepository
from app.schemas.analytics import HeatmapResponse, AnalyticsSummaryResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Heatmap Analytics"])


def get_analytics_service(db: Session = Depends(get_db)) -> AnalyticsService:
    location_repo = LocationSnapshotRepository(db=db)
    risk_repo = RiskRecordRepository(db=db)
    return AnalyticsService(
        location_repository=location_repo,
        risk_repository=risk_repo,
    )


@router.get("/heatmap", response_model=HeatmapResponse)
def get_heatmap(
    timeframe: int = Query(24, description="Timeframe in hours"),
    service: AnalyticsService = Depends(get_analytics_service),
):
    return service.generate_heatmap(timeframe_hours=timeframe)


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_summary(
    service: AnalyticsService = Depends(get_analytics_service),
):
    return service.get_summary()
