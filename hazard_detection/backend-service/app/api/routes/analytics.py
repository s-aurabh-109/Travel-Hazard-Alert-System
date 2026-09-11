from fastapi import APIRouter, HTTPException, Query
from app.core.ai_client import ai_client

router = APIRouter()

@router.get("/heatmap")
def get_heatmap(timeframe: int = Query(24, alias="timeframe_hours")):
    result = ai_client.get_heatmap(timeframe)
    if result is None:
        raise HTTPException(status_code=502, detail="AI service unreachable")
    return result

@router.get("/summary")
def get_analytics_summary():
    result = ai_client.get_analytics_summary()
    if result is None:
        raise HTTPException(status_code=502, detail="AI service unreachable")
    return result
