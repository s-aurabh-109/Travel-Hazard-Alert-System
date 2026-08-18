"""HTTP client for communicating with the AI service."""

import logging
import httpx
from typing import Optional, Dict, List, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIServiceClient:
    """Client for interacting with the ai-service API."""

    def __init__(self):
        self.base_url = f"{settings.AI_SERVICE_URL.rstrip('/')}/api/v1"
        self.timeout = settings.AI_SERVICE_TIMEOUT

    def _request(self, method: str, endpoint: str, **kwargs) -> Any:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.request(method, url, **kwargs)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error {e.response.status_code} on {method} {url}: {e.response.text}")
            return None
        except httpx.RequestError as e:
            logger.error(f"Request error on {method} {url}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error on {method} {url}: {e}")
            return None

    def check_geofence(self, latitude: float, longitude: float):
        return self._request("POST", "geofence/check", json={"latitude": latitude, "longitude": longitude})

    def get_danger_zones(self):
        return self._request("GET", "geofence/danger-zones")

    def create_danger_zone(self, data: dict):
        return self._request("POST", "geofence/danger-zones", json=data)

    def get_nearby_zones(self, lat: float, lon: float, radius_km: float = 50.0):
        return self._request("GET", "geofence/nearby", params={"lat": lat, "lon": lon, "radius_km": radius_km})

    def compute_safety_score(self, data: dict):
        return self._request("POST", "safety-score/compute", json=data)

    def get_safety_score(self, tourist_id: str):
        return self._request("GET", f"safety-score/{tourist_id}")

    def analyze_anomalies(self, data: dict):
        return self._request("POST", "ai/analyze", json=data)

    def get_alerts(self, tourist_id: str):
        return self._request("GET", f"ai/alerts/{tourist_id}")

    def classify_risk(self, data: dict):
        return self._request("POST", "risk/classify", json=data)

    def get_risk_level(self, tourist_id: str):
        return self._request("GET", f"risk/level/{tourist_id}")

    def get_heatmap(self, timeframe_hours: int = 24):
        return self._request("GET", "analytics/heatmap", params={"timeframe": timeframe_hours})

    def get_analytics_summary(self):
        return self._request("GET", "analytics/summary")

    def health_check(self):
        return self._request("GET", "health")

    def forward_location(self, tourist_id: str, latitude: float, longitude: float):
        """
        Forward location data to AI service for risk classification.

        TODO: A dedicated location snapshot endpoint should be added to ai-service.
        Currently, this calls risk/classify which does not persist a location snapshot,
        but provides immediate risk value.
        """
        data = {
            "tourist_id": tourist_id,
            "latitude": latitude,
            "longitude": longitude
        }
        return self.classify_risk(data)

ai_client = AIServiceClient()
