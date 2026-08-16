from fastapi import APIRouter

from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.geofence import router as geofence_router
from app.api.v1.routes.safety_score import router as safety_score_router
from app.api.v1.routes.anomaly import router as anomaly_router
from app.api.v1.routes.risk import router as risk_router
from app.api.v1.routes.analytics import router as analytics_router


api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(health_router)
api_v1_router.include_router(geofence_router)
api_v1_router.include_router(safety_score_router)
api_v1_router.include_router(anomaly_router)
api_v1_router.include_router(risk_router)
api_v1_router.include_router(analytics_router)
