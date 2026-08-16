"""
Repository for RiskRecord persistence.

Provides domain-specific queries on top of BaseRepository CRUD.
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.repositories.base_repository import BaseRepository
from app.models.risk_record import RiskRecord
from app.core.enums.hazard import HazardType
from app.core.enums.risk import RiskLevel


class RiskRecordRepository(BaseRepository[RiskRecord]):
    def __init__(self, db: Session):
        super().__init__(db=db, model=RiskRecord)

    # ── Domain queries ────────────────────────────────

    def get_by_snapshot(
        self, snapshot_id: uuid.UUID
    ) -> List[RiskRecord]:
        """Return all risk records tied to a specific snapshot."""
        stmt = (
            select(RiskRecord)
            .where(RiskRecord.snapshot_id == snapshot_id)
            .order_by(RiskRecord.predicted_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def get_latest_by_hazard(
        self,
        snapshot_id: uuid.UUID,
        hazard_type: HazardType,
    ) -> Optional[RiskRecord]:
        """Return the most recent risk record for a given hazard type."""
        stmt = (
            select(RiskRecord)
            .where(
                RiskRecord.snapshot_id == snapshot_id,
                RiskRecord.hazard_type == hazard_type,
            )
            .order_by(RiskRecord.predicted_at.desc())
            .limit(1)
        )
        return self.db.scalars(stmt).first()

    def get_high_risk_records(
        self, *, hours: int = 24
    ) -> List[RiskRecord]:
        """Return HIGH or CRITICAL risk records within the last N hours."""
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        stmt = (
            select(RiskRecord)
            .where(
                RiskRecord.predicted_at >= cutoff,
                RiskRecord.risk_level.in_([RiskLevel.HIGH, RiskLevel.CRITICAL]),
            )
            .order_by(RiskRecord.predicted_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def get_recent_records(
        self, *, hours: int = 24
    ) -> List[RiskRecord]:
        """Return all risk records within the last N hours."""
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        stmt = (
            select(RiskRecord)
            .where(RiskRecord.predicted_at >= cutoff)
            .order_by(RiskRecord.predicted_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def create_risk_record(
        self,
        snapshot_id: uuid.UUID,
        hazard_type: HazardType,
        risk_level: RiskLevel,
        risk_score: float,
        confidence: float,
        explanation: str,
        model_version: str = "v1.0",
    ) -> RiskRecord:
        """Create and persist a new risk record."""
        record = RiskRecord(
            snapshot_id=snapshot_id,
            hazard_type=hazard_type,
            risk_level=risk_level,
            risk_score=risk_score,
            confidence=confidence,
            explanation=explanation,
            model_version=model_version,
        )
        return self.create(record)

    def count_by_risk_level(self, risk_level: RiskLevel) -> int:
        """Count records at a given risk level."""
        stmt = (
            select(func.count())
            .select_from(RiskRecord)
            .where(RiskRecord.risk_level == risk_level)
        )
        return self.db.scalar(stmt) or 0
