from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.core.ai_client import ai_client
from app.schemas.safety import SafetyOverview, SafetyOverviewRequest
from app.services.hospital_service import get_nearest_hospitals
from app.services.police_service import get_nearest_police_stations
from app.core.redis import redis_client

router = APIRouter()

def build_safety_overview(latitude: float, longitude: float, tourist_id: str = "anonymous") -> dict:
    data_sources = {
        "geofence": False,
        "risk_classification": False,
        "safety_score": False,
        "hospitals": False,
        "police_stations": False
    }
    
    geofence_result = None
    try:
        geofence_result = ai_client.check_geofence(latitude, longitude)
        if geofence_result is not None:
            data_sources["geofence"] = True
    except Exception:
        pass

    risk_result = None
    try:
        risk_result = ai_client.classify_risk({
            "tourist_id": tourist_id,
            "latitude": latitude,
            "longitude": longitude
        })
        if risk_result is not None:
            data_sources["risk_classification"] = True
    except Exception:
        pass

    score_result = None
    try:
        score_result = ai_client.compute_safety_score({
            "tourist_id": tourist_id,
            "latitude": latitude,
            "longitude": longitude
        })
        if score_result is not None:
            data_sources["safety_score"] = True
    except Exception:
        pass

    hospitals = None
    try:
        hospitals = get_nearest_hospitals(latitude, longitude)
        data_sources["hospitals"] = True
    except Exception:
        pass

    police_stations = None
    try:
        police_stations = get_nearest_police_stations(latitude, longitude)
        data_sources["police_stations"] = True
    except Exception:
        pass

    return {
        "timestamp": datetime.utcnow().isoformat(),
        "latitude": latitude,
        "longitude": longitude,
        "tourist_id": tourist_id,
        "geofence": geofence_result,
        "risk": risk_result,
        "safety_score": score_result,
        "hospitals": hospitals,
        "police_stations": police_stations,
        "data_sources": data_sources
    }

@router.post("/overview")
def get_safety_overview_post(request: SafetyOverviewRequest):
    tourist_id = request.tourist_id if request.tourist_id else "anonymous"
    overview = build_safety_overview(request.latitude, request.longitude, tourist_id)
    return overview

@router.get("/overview/{tourist_id}")
def get_safety_overview_get(tourist_id: str):
    try:
        tourist_data = redis_client.hgetall(f"tourist:{tourist_id}")
    except Exception:
        tourist_data = {}
        
    # We might need to decode bytes to string depending on redis client version
    if not tourist_data:
        raise HTTPException(status_code=404, detail="Tourist location not found in Redis")
    
    # hgetall can return bytes keys and values
    def decode_val(val):
        return val.decode("utf-8") if isinstance(val, bytes) else val

    latitude = tourist_data.get("latitude") or tourist_data.get(b"latitude")
    longitude = tourist_data.get("longitude") or tourist_data.get(b"longitude")
    
    if latitude is None or longitude is None:
        raise HTTPException(status_code=400, detail="Invalid location data in Redis")
    
    latitude = decode_val(latitude)
    longitude = decode_val(longitude)
    
    try:
        lat = float(latitude)
        lon = float(longitude)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid coordinate format in Redis")
    
    overview = build_safety_overview(lat, lon, tourist_id)
    return overview
