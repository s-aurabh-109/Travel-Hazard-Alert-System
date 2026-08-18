import logging

from app.schemas.location import Location
from app.core.redis import redis_client
from app.core.ai_client import ai_client

logger = logging.getLogger("backend")


def process_location(location: Location):
    """Store tourist location in Redis and forward to AI service for analysis."""

    # ── Store in Redis (real-time tracking) ────────────
    key = f"tourist:{location.tourist_id}"
    redis_client.hset(
        key,
        mapping={
            "latitude": location.latitude,
            "longitude": location.longitude,
            "timestamp": location.timestamp,
        },
    )
    redis_client.expire(key, 300)

    logger.info(
        "Location received: tourist=%s lat=%.4f lon=%.4f",
        location.tourist_id,
        location.latitude,
        location.longitude,
    )

    # ── Forward to AI service (risk analysis) ─────────
    ai_forwarded = False
    try:
        result = ai_client.classify_risk({
            "tourist_id": location.tourist_id,
            "latitude": location.latitude,
            "longitude": location.longitude,
        })
        ai_forwarded = result is not None
        if ai_forwarded:
            logger.info(
                "AI risk analysis triggered for tourist=%s",
                location.tourist_id,
            )
    except Exception as e:
        logger.warning(
            "Failed to forward location to AI service: %s", e
        )

    return {
        "message": "Location received successfully",
        "ai_forwarded": ai_forwarded,
    }