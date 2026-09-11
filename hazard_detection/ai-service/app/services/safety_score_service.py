from datetime import datetime, timezone


class SafetyScoreService:
    """Computes dynamic safety scores for tourists based on multiple risk factors."""

    WEIGHTS = {
        "time_of_day": 0.15,
        "geofence": 0.30,
        "route_deviation": 0.20,
        "sos_history": 0.15,
        "inactivity": 0.20,
    }

    def compute_safety_score(
        self,
        tourist_id: str,
        latitude: float,
        longitude: float,
        geofence_classification: str = "SAFE",
        is_on_expected_route: bool = True,
        recent_sos_count: int = 0,
        last_activity_minutes_ago: int = 0,
    ) -> dict:

        time_score = self._time_of_day_score()
        geofence_score = self._geofence_score(geofence_classification)
        route_score = self._route_deviation_score(is_on_expected_route)
        sos_score = self._sos_history_score(recent_sos_count)
        inactivity_score = self._inactivity_score(last_activity_minutes_ago)

        overall = (
            time_score * self.WEIGHTS["time_of_day"]
            + geofence_score * self.WEIGHTS["geofence"]
            + route_score * self.WEIGHTS["route_deviation"]
            + sos_score * self.WEIGHTS["sos_history"]
            + inactivity_score * self.WEIGHTS["inactivity"]
        )
        overall = round(overall, 2)

        if overall >= 75:
            risk_label = "LOW"
        elif overall >= 50:
            risk_label = "MEDIUM"
        elif overall >= 25:
            risk_label = "HIGH"
        else:
            risk_label = "CRITICAL"

        recommendations = self._generate_recommendations(
            time_score, geofence_score, route_score, sos_score, inactivity_score
        )

        return {
            "tourist_id": tourist_id,
            "overall_score": overall,
            "risk_label": risk_label,
            "factors": {
                "time_of_day_score": round(time_score, 2),
                "geofence_score": round(geofence_score, 2),
                "route_deviation_score": round(route_score, 2),
                "sos_history_score": round(sos_score, 2),
                "inactivity_score": round(inactivity_score, 2),
            },
            "recommendations": recommendations,
            "computed_at": datetime.now(timezone.utc),
        }

    def _time_of_day_score(self) -> float:
        hour = datetime.now(timezone.utc).hour
        if 6 <= hour < 18:
            return 100.0
        elif 18 <= hour < 22:
            return 70.0
        elif 22 <= hour or hour < 2:
            return 35.0
        else:
            return 20.0

    def _geofence_score(self, classification: str) -> float:
        mapping = {"SAFE": 100.0, "WARNING": 45.0, "DANGER": 10.0}
        return mapping.get(classification, 75.0)

    def _route_deviation_score(self, is_on_route: bool) -> float:
        return 100.0 if is_on_route else 30.0

    def _sos_history_score(self, count: int) -> float:
        if count == 0:
            return 100.0
        elif count == 1:
            return 70.0
        elif count == 2:
            return 45.0
        else:
            return 15.0

    def _inactivity_score(self, minutes: int) -> float:
        if minutes <= 30:
            return 100.0
        elif minutes <= 60:
            return 80.0
        elif minutes <= 180:
            return 45.0
        elif minutes <= 360:
            return 20.0
        else:
            return 5.0

    def _generate_recommendations(self, time_s, geo_s, route_s, sos_s, inact_s) -> list[str]:
        recs = []
        if time_s < 40:
            recs.append("Avoid traveling at night. Seek a safe shelter.")
        if geo_s < 50:
            recs.append("You are near a danger zone. Move to a safer area.")
        if route_s < 50:
            recs.append("Tourist has deviated from expected route. Verify location.")
        if sos_s < 50:
            recs.append("Multiple SOS events detected in this area. Exercise extreme caution.")
        if inact_s < 50:
            recs.append("Tourist appears inactive for extended period. Welfare check recommended.")
        if not recs:
            recs.append("No immediate safety concerns detected. Continue monitoring.")
        return recs
