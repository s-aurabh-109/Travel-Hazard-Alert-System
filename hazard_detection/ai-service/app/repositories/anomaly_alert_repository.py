"""
Repository for AnomalyAlert persistence.

Provides domain-specific queries on top of BaseRepository CRUD.
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.repositories.base_repository import BaseRepository
from app.models.anomaly_alert import AnomalyAlert
from app.core.enums.alert_severity import AlertSeverity
from app.core.enums.alert_status import AlertStatus


class AnomalyAlertRepository(BaseRepository[AnomalyAlert]):
    def __init__(self, db: Session):
        super().__init__(db=db, model=AnomalyAlert)

    # ── Domain queries ────────────────────────────────

    def get_alerts_by_tourist(
        self, tourist_id: str
    ) -> List[AnomalyAlert]:
        """
        Return all alerts for a tourist by joining through
        risk_record → location_snapshot.
        """
        from app.models.risk_record import RiskRecord
        from app.models.location_snapshot import LocationSnapshot

        stmt = (
            select(AnomalyAlert)
            .join(RiskRecord, AnomalyAlert.risk_record_id == RiskRecord.id)
            .join(LocationSnapshot, RiskRecord.snapshot_id == LocationSnapshot.id)
            .where(LocationSnapshot.tourist_id == tourist_id)
            .order_by(AnomalyAlert.created_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def get_active_alerts(self) -> List[AnomalyAlert]:
        """Return all currently active (unresolved) alerts."""
        stmt = (
            select(AnomalyAlert)
            .where(AnomalyAlert.status == AlertStatus.ACTIVE)
            .order_by(AnomalyAlert.created_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def get_by_severity(
        self, severity: AlertSeverity
    ) -> List[AnomalyAlert]:
        """Return alerts filtered by severity level."""
        stmt = (
            select(AnomalyAlert)
            .where(AnomalyAlert.severity == severity)
            .order_by(AnomalyAlert.created_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def get_recent_alerts(
        self, *, hours: int = 24
    ) -> List[AnomalyAlert]:
        """Return alerts created within the last N hours."""
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        stmt = (
            select(AnomalyAlert)
            .where(AnomalyAlert.created_at >= cutoff)
            .order_by(AnomalyAlert.created_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def create_alert(
        self,
        risk_record_id: uuid.UUID,
        title: str,
        message: str,
        severity: AlertSeverity,
    ) -> AnomalyAlert:
        """Create and persist a new anomaly alert."""
        alert = AnomalyAlert(
            risk_record_id=risk_record_id,
            title=title,
            message=message,
            severity=severity,
            status=AlertStatus.ACTIVE,
        )
        return self.create(alert)

    def resolve_alert(self, alert_id: uuid.UUID) -> Optional[AnomalyAlert]:
        """Mark an alert as resolved."""
        alert = self.get_by_id(alert_id)
        if alert:
            alert.status = AlertStatus.RESOLVED
            alert.resolved_at = datetime.now(timezone.utc)
            return self.save(alert)
        return None

    def acknowledge_alert(self, alert_id: uuid.UUID) -> Optional[AnomalyAlert]:
        """Mark an alert as acknowledged."""
        alert = self.get_by_id(alert_id)
        if alert:
            alert.status = AlertStatus.ACKNOWLEDGED
            return self.save(alert)
        return None

    def count_active(self) -> int:
        """Count currently active alerts."""
        stmt = (
            select(func.count())
            .select_from(AnomalyAlert)
            .where(AnomalyAlert.status == AlertStatus.ACTIVE)
        )
        return self.db.scalar(stmt) or 0
