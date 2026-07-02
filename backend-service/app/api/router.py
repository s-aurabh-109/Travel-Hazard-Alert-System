from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.hospital import router as hospital_router
from app.api.routes.location import router as location_router
from app.api.routes.police import router as police_router

api_router = APIRouter()

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
