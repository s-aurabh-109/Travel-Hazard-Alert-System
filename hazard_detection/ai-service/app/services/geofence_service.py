from datetime import datetime, timezone
from uuid import UUID

from app.repositories.danger_zone_repository import DangerZoneRepository
from app.utils.geo_utils import haversine_distance


class GeofenceService:
    """Determines if a tourist's location falls inside or near a danger zone."""

    def __init__(self, danger_zone_repository: DangerZoneRepository):
        self.danger_zone_repository = danger_zone_repository

    def check_location(self, latitude: float, longitude: float) -> dict:
        """Check a location against all active danger zones."""
        zones = self.danger_zone_repository.get_active_zones()
        nearby_zones = []
        has_danger = False
        has_warning = False

        for zone in zones:
            distance = haversine_distance(latitude, longitude, zone.latitude, zone.longitude)
            if distance <= zone.radius_km:
                nearby_zones.append({
                    "zone_id": zone.id,
                    "name": zone.name,
                    "hazard_type": zone.hazard_type,
                    "severity": zone.severity,
                    "distance_km": round(distance, 2),
                    "status": "INSIDE",
                })
                has_danger = True
            elif distance <= zone.radius_km * 2.0:
                nearby_zones.append({
                    "zone_id": zone.id,
                    "name": zone.name,
                    "hazard_type": zone.hazard_type,
                    "severity": zone.severity,
                    "distance_km": round(distance, 2),
                    "status": "NEARBY",
                })
                has_warning = True

        if has_danger:
            classification = "DANGER"
            overall_risk = "HIGH"
        elif has_warning:
            classification = "WARNING"
            overall_risk = "MEDIUM"
        else:
            classification = "SAFE"
            overall_risk = "LOW"

        return {
            "classification": classification,
            "overall_risk": overall_risk,
            "nearby_zones": nearby_zones,
            "checked_at": datetime.now(timezone.utc),
        }

    def get_all_zones(self) -> list:
        return self.danger_zone_repository.get_active_zones()

    def get_nearby_zones(self, latitude: float, longitude: float, radius_km: float = 50.0) -> list:
        zones = self.danger_zone_repository.get_active_zones()
        nearby = []
        for zone in zones:
            distance = haversine_distance(latitude, longitude, zone.latitude, zone.longitude)
            if distance <= radius_km:
                nearby.append({"zone": zone, "distance_km": round(distance, 2)})
        nearby.sort(key=lambda x: x["distance_km"])
        return nearby
