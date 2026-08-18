from fastapi import APIRouter, HTTPException, Body
from app.core.ai_client import ai_client

router = APIRouter()

@router.post("/analyze")
def analyze_anomalies(data: dict = Body(...)):
    result = ai_client.analyze_anomalies(data)
    if result is None:
        raise HTTPException(status_code=502, detail="AI service unreachable")
    return result

@router.get("/alerts/{tourist_id}")
def get_alerts(tourist_id: str):
    result = ai_client.get_alerts(tourist_id)
    if result is None:
        raise HTTPException(status_code=502, detail="AI service unreachable")
    return result
