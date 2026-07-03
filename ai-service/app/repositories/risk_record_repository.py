from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from .base_repository import BaseRepository

from app.models import (
    RiskRecord,
    LocationSnapshot,
)
from app.core.enums import (
    HazardType,
    RiskLevel,
)


class RiskRecordRepository(
    BaseRepository[RiskRecord]
):
    """
    Repository responsible for all database
    operations related to RiskRecord.
    """

    def __init__(self, db: Session):

        super().__init__(
            db=db,
            model=RiskRecord,
        )

    # --------------------------------------------------
    # CREATE
    # --------------------------------------------------

    def create_risk_record(
        self,
        snapshot_id: UUID,
        hazard_type: HazardType,
        risk_level: RiskLevel,
        risk_score: float,
        confidence: float,
        explanation: str,
        model_version: str = "v1.0",
    ) -> RiskRecord:

        risk_record = RiskRecord(
            snapshot_id=snapshot_id,
            hazard_type=hazard_type,
            risk_level=risk_level,
            risk_score=risk_score,
            confidence=confidence,
            explanation=explanation,
            model_version=model_version,
        )

        self.db.add(risk_record)
        self.db.commit()
        self.db.refresh(risk_record)
        return risk_record

    # --------------------------------------------------
    # READ
    # --------------------------------------------------

    def get_risk_records_by_snapshot(
        self,
        snapshot_id: UUID,
    ) -> list[RiskRecord]:

        stmt = (
            select(RiskRecord)
            .where(
                RiskRecord.snapshot_id == snapshot_id
            )
            .order_by(
                RiskRecord.predicted_at.desc()
            )
        )

        return list(
            self.db.scalars(stmt).all()
        )

    def get_risk_records_by_tourist(
        self,
        tourist_id: str,
    ) -> list[RiskRecord]:

        stmt = (
            select(RiskRecord)
            .join(LocationSnapshot)
            .where(
                LocationSnapshot.tourist_id == tourist_id
            )
            .options(
                joinedload(RiskRecord.snapshot)
            )
            .order_by(
                RiskRecord.predicted_at.desc()
            )
        )

        return list(
            self.db.scalars(stmt).all()
        )

    def get_latest_risk_by_hazard(
        self,
        snapshot_id: UUID,
        hazard_type: HazardType,
    ) -> RiskRecord | None:

        stmt = (
            select(RiskRecord)
            .where(
                RiskRecord.snapshot_id == snapshot_id,
                RiskRecord.hazard_type == hazard_type,
            )
            .order_by(
                RiskRecord.predicted_at.desc()
            )
            .limit(1)
        )

        return self.db.scalar(stmt)

    def list_risk_records(
        self,
        limit: int = 100,
        offset: int = 0,
    ) -> list[RiskRecord]:

        stmt = (
            select(RiskRecord)
            .order_by(
                RiskRecord.predicted_at.desc()
            )
            .offset(offset)
            .limit(limit)
        )

        return list(
            self.db.scalars(stmt).all()
        )
