from fastapi import APIRouter, HTTPException, Query

from app.schemas.hospital import NearestHospitalsResponse
from app.services.hospital_service import (
    HospitalProviderError,
    get_nearest_hospitals,
    get_nearest_hospitals_for_tourist,
)

router = APIRouter()


@router.get("/nearest", response_model=NearestHospitalsResponse)
def nearest_hospitals(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    limit: int = Query(5, ge=1, le=10),
    radius_meters: int = Query(5000, ge=100, le=50000),
):
    try:
        return get_nearest_hospitals(latitude, longitude, limit, radius_meters)
    except HospitalProviderError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error


@router.get("/nearest/from-redis/{tourist_id}", response_model=NearestHospitalsResponse)
def nearest_hospitals_from_redis(
    tourist_id: str,
    limit: int = Query(5, ge=1, le=10),
    radius_meters: int = Query(5000, ge=100, le=50000),
):
    try:
        result = get_nearest_hospitals_for_tourist(
            tourist_id,
            limit,
            radius_meters,
        )
    except HospitalProviderError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error

    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"No active location found in Redis for tourist_id '{tourist_id}'",
        )

    return result
