from datetime import datetime, timezone, timedelta

from app.core.enums import AlertSeverity
from app.repositories.location_snapshot_repository import LocationSnapshotRepository
from app.repositories.anomaly_alert_repository import AnomalyAlertRepository
from app.repositories.risk_record_repository import RiskRecordRepository
from app.utils.geo_utils import haversine_distance


class AnomalyDetectionService:
    """Detects suspicious behavior patterns for tourist safety."""

    def __init__(
        self,
        location_repository: LocationSnapshotRepository,
        alert_repository: AnomalyAlertRepository,
        risk_repository: RiskRecordRepository,
    ):
        self.location_repository = location_repository
        self.alert_repository = alert_repository
        self.risk_repository = risk_repository

    def detect_anomalies(
        self,
        tourist_id: str,
        latitude: float,
        longitude: float,
        geofence_status: str = "SAFE",
    ) -> dict:
        alerts = []

        latest = self.location_repository.get_latest_snapshot(tourist_id)

        # Rule 1: Inactivity detection
        if latest:
            now = datetime.now(timezone.utc)
            captured = latest.captured_at
            if captured.tzinfo is None:
                captured = captured.replace(tzinfo=timezone.utc)
            minutes_since = (now - captured).total_seconds() / 60

            if minutes_since > 720:
                alerts.append({
                    "anomaly_type": "INACTIVITY",
                    "severity": "CRITICAL",
                    "title": "Tourist Possibly Missing",
                    "message": f"No activity detected for {int(minutes_since / 60)} hours. Immediate welfare check required.",
                    "details": {"inactive_minutes": int(minutes_since)},
                })
            elif minutes_since > 360:
                alerts.append({
                    "anomaly_type": "INACTIVITY",
                    "severity": "HIGH",
                    "title": "Extended Inactivity Alert",
                    "message": f"No activity detected for {int(minutes_since / 60)} hours.",
                    "details": {"inactive_minutes": int(minutes_since)},
                })
            elif minutes_since > 180:
                alerts.append({
                    "anomaly_type": "INACTIVITY",
                    "severity": "MEDIUM",
                    "title": "Inactivity Warning",
                    "message": f"No activity detected for {int(minutes_since / 60)} hours.",
                    "details": {"inactive_minutes": int(minutes_since)},
                })

        # Rule 2: Speed anomaly
        if latest:
            distance = haversine_distance(latitude, longitude, latest.latitude, latest.longitude)
            captured = latest.captured_at
            if captured.tzinfo is None:
                captured = captured.replace(tzinfo=timezone.utc)
            time_diff_hours = (datetime.now(timezone.utc) - captured).total_seconds() / 3600

            if time_diff_hours > 0.01:
                speed = distance / time_diff_hours
                if speed > 500:
                    alerts.append({
                        "anomaly_type": "SPEED_ANOMALY",
                        "severity": "HIGH",
                        "title": "Impossible Speed Detected",
                        "message": f"Tourist moved {distance:.1f} km in {time_diff_hours:.2f} hours ({speed:.0f} km/h). Possible GPS spoofing.",
                        "details": {"speed_kmh": round(speed, 1), "distance_km": round(distance, 2)},
                    })
                elif speed > 200:
                    alerts.append({
                        "anomaly_type": "SPEED_ANOMALY",
                        "severity": "MEDIUM",
                        "title": "Unusual Speed Detected",
                        "message": f"Tourist moved {distance:.1f} km at approximately {speed:.0f} km/h.",
                        "details": {"speed_kmh": round(speed, 1), "distance_km": round(distance, 2)},
                    })

        # Rule 3: Disappearance
        all_snapshots = self.location_repository.get_snapshots_by_tourist(tourist_id)
        if len(all_snapshots) >= 5 and latest:
            captured = latest.captured_at
            if captured.tzinfo is None:
                captured = captured.replace(tzinfo=timezone.utc)
            hours_since = (datetime.now(timezone.utc) - captured).total_seconds() / 3600
            if hours_since > 24:
                alerts.append({
                    "anomaly_type": "DISAPPEARANCE",
                    "severity": "CRITICAL",
                    "title": "Tourist Disappearance Alert",
                    "message": f"Tourist had regular activity but has been missing for {int(hours_since)} hours.",
                    "details": {"hours_missing": int(hours_since), "previous_snapshots": len(all_snapshots)},
                })

        # Rule 4: Danger zone entry
        if geofence_status == "DANGER":
            alerts.append({
                "anomaly_type": "DANGER_ZONE_ENTRY",
                "severity": "HIGH",
                "title": "Tourist Entered Danger Zone",
                "message": "Tourist is currently located inside a designated danger zone.",
                "details": {"geofence_status": geofence_status},
            })
        elif geofence_status == "WARNING":
            alerts.append({
                "anomaly_type": "DANGER_ZONE_ENTRY",
                "severity": "MEDIUM",
                "title": "Tourist Near Danger Zone",
                "message": "Tourist is approaching a designated danger zone.",
                "details": {"geofence_status": geofence_status},
            })

        return {
            "tourist_id": tourist_id,
            "anomalies_detected": len(alerts),
            "alerts": alerts,
            "analyzed_at": datetime.now(timezone.utc),
        }
