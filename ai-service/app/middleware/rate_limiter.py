"""
Simple in-memory rate-limiting middleware.

Uses a sliding-window counter keyed by client IP.
Suitable for single-instance dev; swap with Redis-backed
limiter for production / multi-instance deployments.
"""

import time
import logging
from collections import defaultdict

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

logger = logging.getLogger("ai_service")

# ── Configuration ─────────────────────────────────────
MAX_REQUESTS = 100        # requests per window
WINDOW_SECONDS = 60       # sliding window size


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """IP-based sliding-window rate limiter."""

    def __init__(self, app):
        super().__init__(app)
        # { ip: [timestamp, timestamp, ...] }
        self._hits: dict[str, list[float]] = defaultdict(list)

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - WINDOW_SECONDS

        # Trim old timestamps outside the window
        hits = self._hits[client_ip]
        self._hits[client_ip] = [t for t in hits if t > window_start]

        if len(self._hits[client_ip]) >= MAX_REQUESTS:
            logger.warning("Rate limit exceeded for %s", client_ip)
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Try again later."},
            )

        self._hits[client_ip].append(now)
        return await call_next(request)
