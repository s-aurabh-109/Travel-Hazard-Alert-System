from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.hospital import router as hospital_router
from app.api.routes.location import router as location_router
from app.api.routes.police import router as police_router
from app.api.routes.geofence import router as geofence_router
from app.api.routes.risk import router as risk_router
from app.api.routes.ai import router as ai_router
from app.api.routes.safety_score import router as safety_score_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.safety import router as safety_router

api_router = APIRouter()

# ── Existing routes ───────────────────────────────────

api_router.include_router(
    health_router,
    prefix="/health",
    tags=["Health"],
)

api_router.include_router(
    location_router,
    prefix="/location",
    tags=["Location"],
)

api_router.include_router(
    hospital_router,
    prefix="/hospitals",
    tags=["Hospitals"],
)

api_router.include_router(
    police_router,
    prefix="/police",
    tags=["Police"],
)

# ── AI-Service integration routes ─────────────────────

api_router.include_router(
    geofence_router,
    prefix="/geofence",
    tags=["Geofence"],
)

api_router.include_router(
    risk_router,
    prefix="/risk",
    tags=["Risk Classification"],
)

api_router.include_router(
    ai_router,
    prefix="/ai",
    tags=["Anomaly Detection"],
)

api_router.include_router(
    safety_score_router,
    prefix="/safety-score",
    tags=["Safety Score"],
)

api_router.include_router(
    analytics_router,
    prefix="/analytics",
    tags=["Analytics"],
)

api_router.include_router(
    safety_router,
    prefix="/safety",
    tags=["Safety Overview"],
)
