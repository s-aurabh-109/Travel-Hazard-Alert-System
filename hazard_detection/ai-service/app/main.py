from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_v1_router
from app.core.config import get_settings
from app.core.exceptions import AIServiceException
from app.core.logging import setup_logging
from app.middleware.request_logger import RequestLoggerMiddleware
from app.middleware.rate_limiter import RateLimiterMiddleware


# --------------------------------------------------
# Initialize Logger
# --------------------------------------------------

logger = setup_logging()

# --------------------------------------------------
# Create Application
# --------------------------------------------------

settings = get_settings()

app = FastAPI(
    title="AI Service — Travel Hazard Alert System",
    description=(
        "AI microservice for tourist safety analysis. "
        "Provides geo-fencing, safety scoring, anomaly "
        "detection, risk classification, and analytics."
    ),
    version=settings.MODEL_VERSION,
)

# --------------------------------------------------
# Middleware
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestLoggerMiddleware)
app.add_middleware(RateLimiterMiddleware)

# --------------------------------------------------
# Exception Handlers
# --------------------------------------------------


@app.exception_handler(AIServiceException)
async def ai_service_exception_handler(
    request: Request,
    exc: AIServiceException,
):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": type(exc).__name__,
            "detail": exc.message,
        },
    )


# --------------------------------------------------
# Include Routers
# --------------------------------------------------

app.include_router(api_v1_router)

# --------------------------------------------------
# Root Endpoints
# --------------------------------------------------


@app.get("/")
def root():
    return {
        "message": "AI Service is running",
        "version": settings.MODEL_VERSION,
        "docs": "/docs",
    }


# --------------------------------------------------
# Startup Notes
# --------------------------------------------------

# .venv\Scripts\activate
# http://localhost:8001/
# docker compose exec ai-service python -m alembic revision --autogenerate -m "Initial database schema"
# docker compose exec ai-service python -m alembic upgrade head
# To enter into PostgreSQL container: docker compose exec postgres psql -U postgres -d ai_db
# \dt to display table and \d location_snapshot  to describe table
# Press q (just the letter q, don't type Enter) → exits the (END) screen.
# If you then see the psql prompt and want to exit psql, type: \q and press Enter.
# docker compose logs --tail=20 ai-service
