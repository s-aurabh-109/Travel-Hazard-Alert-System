from collections import defaultdict
from datetime import datetime, timezone, timedelta

from sqlalchemy import select

from app.models.location_snapshot import LocationSnapshot
from app.models.risk_record import RiskRecord
from app.repositories.location_snapshot_repository import LocationSnapshotRepository
from app.repositories.risk_record_repository import RiskRecordRepository


class AnalyticsService:
    """Generates heatmap data and analytics summaries from tourist location data."""

    GRID_SIZE = 0.05  # degrees (~5km)

    def __init__(
        self,
        location_repository: LocationSnapshotRepository,
        risk_repository: RiskRecordRepository,
    ):
        self.location_repository = location_repository
        self.risk_repository = risk_repository

    def generate_heatmap(self, timeframe_hours: int = 24) -> dict:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=timeframe_hours)
        stmt = (
            select(LocationSnapshot)
            .where(LocationSnapshot.captured_at >= cutoff)
            .order_by(LocationSnapshot.captured_at.desc())
        )
        snapshots = list(self.location_repository.db.scalars(stmt).all())

        grid: dict[tuple, dict] = defaultdict(lambda: {"count": 0, "tourists": set()})
        for snap in snapshots:
            key = (
                round(snap.latitude / self.GRID_SIZE) * self.GRID_SIZE,
                round(snap.longitude / self.GRID_SIZE) * self.GRID_SIZE,
            )
            grid[key]["count"] += 1
            grid[key]["tourists"].add(snap.tourist_id)

        max_count = max((cell["count"] for cell in grid.values()), default=1)
        unique_tourists = set()
        for cell in grid.values():
            unique_tourists.update(cell["tourists"])

        heatmap_data = []
        clusters = []
        for (lat, lon), cell in grid.items():
            intensity = round(cell["count"] / max_count, 4) if max_count > 0 else 0
            heatmap_data.append({
                "latitude": round(lat, 4),
                "longitude": round(lon, 4),
                "intensity": intensity,
                "tourist_count": cell["count"],
            })
            if cell["count"] >= 3:
                if cell["count"] >= 20:
                    density = "VERY_HIGH"
                elif cell["count"] >= 10:
                    density = "HIGH"
                elif cell["count"] >= 5:
                    density = "MODERATE"
                else:
                    density = "LOW"
                clusters.append({
                    "center_latitude": round(lat, 4),
                    "center_longitude": round(lon, 4),
                    "radius_km": 2.5,
                    "tourist_count": cell["count"],
                    "density_label": density,
                })

        heatmap_data.sort(key=lambda x: x["tourist_count"], reverse=True)
        clusters.sort(key=lambda x: x["tourist_count"], reverse=True)

        return {
            "timeframe_hours": timeframe_hours,
            "total_snapshots": len(snapshots),
            "total_unique_tourists": len(unique_tourists),
            "heatmap_data": heatmap_data,
            "clusters": clusters,
            "generated_at": datetime.now(timezone.utc),
        }

    def get_summary(self) -> dict:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=24)

        snap_stmt = select(LocationSnapshot).where(LocationSnapshot.captured_at >= cutoff)
        snapshots = list(self.location_repository.db.scalars(snap_stmt).all())
        unique_tourists = set(s.tourist_id for s in snapshots)

        risk_stmt = select(RiskRecord).where(RiskRecord.predicted_at >= cutoff)
        risk_records = list(self.risk_repository.db.scalars(risk_stmt).all())

        risk_dist: dict[str, int] = defaultdict(int)
        total_score = 0.0
        for rr in risk_records:
            risk_dist[rr.risk_level.value] += 1
            total_score += rr.risk_score

        avg_score = round(total_score / len(risk_records), 4) if risk_records else 0.0

        heatmap = self.generate_heatmap(24)
        top_locs = heatmap["heatmap_data"][:5]

        return {
            "total_active_tourists": len(unique_tourists),
            "risk_distribution": dict(risk_dist),
            "top_locations": top_locs,
            "avg_risk_score": avg_score,
            "generated_at": datetime.now(timezone.utc),
        }
