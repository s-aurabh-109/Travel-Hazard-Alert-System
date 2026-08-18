from fastapi import APIRouter, HTTPException, Body
from app.core.ai_client import ai_client

router = APIRouter()

@router.post("/compute")
def compute_safety_score(data: dict = Body(...)):
    result = ai_client.compute_safety_score(data)
    if result is None:
        raise HTTPException(status_code=502, detail="AI service unreachable")
    return result

@router.get("/{tourist_id}")
def get_safety_score(tourist_id: str):
    result = ai_client.get_safety_score(tourist_id)
    if result is None:
        raise HTTPException(status_code=502, detail="AI service unreachable")
    return result
