from fastapi import APIRouter, HTTPException, Query

from app.schemas.police import NearestPoliceStationsResponse
from app.services.police_service import (
    get_nearest_police_stations,
    get_nearest_police_stations_for_tourist,
)

router = APIRouter()


@router.get("/nearest", response_model=NearestPoliceStationsResponse)
def nearest_police_stations(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    limit: int = Query(5, ge=1, le=10),
    radius_meters: int = Query(10000, ge=100, le=50000),
):
    return get_nearest_police_stations(latitude, longitude, limit, radius_meters)


@router.get("/nearest/from-redis/{tourist_id}", response_model=NearestPoliceStationsResponse)
def nearest_police_stations_from_redis(
    tourist_id: str,
    limit: int = Query(5, ge=1, le=10),
    radius_meters: int = Query(10000, ge=100, le=50000),
):
    result = get_nearest_police_stations_for_tourist(
        tourist_id,
        limit,
        radius_meters,
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"No active location found in Redis for tourist_id '{tourist_id}'",
        )

    return result
