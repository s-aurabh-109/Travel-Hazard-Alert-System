from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.geofence import GeofenceCheckRequest, GeofenceCheckResponse, DangerZoneRead, DangerZoneCreate
from app.repositories.danger_zone_repository import DangerZoneRepository
from app.services.geofence_service import GeofenceService
from app.models.danger_zone import DangerZone

router = APIRouter(prefix="/geofence", tags=["Geo-Fencing"])

@router.post("/check", response_model=GeofenceCheckResponse)
def check_location(request: GeofenceCheckRequest, db: Session = Depends(get_db)):
    repo = DangerZoneRepository(db)
    service = GeofenceService(repo)
    return service.check_location(request.latitude, request.longitude)

@router.get("/danger-zones", response_model=list[DangerZoneRead])
def get_danger_zones(db: Session = Depends(get_db)):
    repo = DangerZoneRepository(db)
    return repo.get_active_zones()

@router.post("/danger-zones", response_model=DangerZoneRead)
def create_danger_zone(zone: DangerZoneCreate, db: Session = Depends(get_db)):
    repo = DangerZoneRepository(db)
    return repo.create(DangerZone(**zone.model_dump()))

@router.get("/nearby")
def get_nearby_zones(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius_km: float = Query(50.0, description="Radius in km"),
    db: Session = Depends(get_db)
):
    repo = DangerZoneRepository(db)
    service = GeofenceService(repo)
    return service.get_nearby_zones(lat, lon, radius_km)
