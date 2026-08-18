import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.redis import redis_client
from app.core.ai_client import ai_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    # ── Startup ───────────────────────────────────────
    try:
        redis_client.ping()
        logger.info("✅ Connected to Redis")
    except Exception as e:
        logger.error("❌ Redis connection failed: %s", e)

    try:
        ai_health = ai_client.health_check()
        if ai_health:
            logger.info("✅ Connected to AI Service (status: %s)", ai_health.get("status", "unknown"))
        else:
            logger.warning("⚠️  AI Service is not reachable — proxy endpoints will return 502")
    except Exception as e:
        logger.warning("⚠️  AI Service health check failed: %s", e)

    yield

    # ── Shutdown ──────────────────────────────────────
    logger.info("🛑 Shutting down backend service")


app = FastAPI(
    title="Tourist Safety Backend",
    description=(
        "Unified API gateway for the Travel Hazard Alert System. "
        "Provides emergency service lookups, geofence analysis, "
        "risk classification, safety scoring, and anomaly detection."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

# To run backend: uvicorn main:app --reload
# For swagger: http://localhost:8000/docs
# For docker image: docker build -t tourist-backend .
# docker stop tourist-backend-container
# docker rm tourist-backend-container
# docker run -d --name tourist-backend-container -p 8000:8000 tourist-backend
# docker exec -it redis-container redis-cli
# without -d for first time to compose: docker compose up --build
# otherwise, run this for docker compose.yml to compose: docker compose up -d --build
# run: docker compose up  or docker compose up -d
# stop: docker compose down
# see running container: docker ps
# see logs: docker compose logs || docker compose logs backend || docker compose logs frontend
# Now after linking with docker volumes: docker compose up