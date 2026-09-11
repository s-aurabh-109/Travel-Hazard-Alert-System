from fastapi import APIRouter, HTTPException, Body
from app.core.ai_client import ai_client

router = APIRouter()

@router.post("/classify")
def classify_risk(data: dict = Body(...)):
    result = ai_client.classify_risk(data)
    if result is None:
        raise HTTPException(status_code=502, detail="AI service unreachable")
    return result

@router.get("/level/{tourist_id}")
def get_risk_level(tourist_id: str):
    result = ai_client.get_risk_level(tourist_id)
    if result is None:
        raise HTTPException(status_code=502, detail="AI service unreachable")
    return result
