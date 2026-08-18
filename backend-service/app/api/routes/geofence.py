from fastapi import APIRouter, HTTPException, Body, Query
from app.core.ai_client import ai_client

router = APIRouter()

@router.post("/check")
def check_geofence(latitude: float = Body(...), longitude: float = Body(...)):
    result = ai_client.check_geofence(latitude, longitude)
    if result is None:
        raise HTTPException(status_code=502, detail="AI service unreachable")
    return result

@router.get("/danger-zones")
def get_danger_zones():
    result = ai_client.get_danger_zones()
    if result is None:
        raise HTTPException(status_code=502, detail="AI service unreachable")
    return result

@router.post("/danger-zones")
def create_danger_zone(data: dict = Body(...)):
    result = ai_client.create_danger_zone(data)
    if result is None:
        raise HTTPException(status_code=502, detail="AI service unreachable")
    return result

@router.get("/nearby")
def get_nearby_zones(lat: float = Query(...), lon: float = Query(...), radius_km: float = Query(...)):
    result = ai_client.get_nearby_zones(lat, lon, radius_km)
    if result is None:
        raise HTTPException(status_code=502, detail="AI service unreachable")
    return result
