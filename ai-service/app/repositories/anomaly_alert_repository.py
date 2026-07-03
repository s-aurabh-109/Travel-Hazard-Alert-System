from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from .base_repository import BaseRepository

from app.models import (
    AnomalyAlert,
    RiskRecord,
)
from app.core.enums import (
    AlertSeverity,
    AlertStatus,
)


class AnomalyAlertRepository(
    BaseRepository[AnomalyAlert]
):
    """
    Repository responsible for all database
    operations related to AnomalyAlert.
    """

    def __init__(self, db: Session):

        super().__init__(
            db=db,
            model=AnomalyAlert,
        )

    # --------------------------------------------------
    # CREATE
    # --------------------------------------------------

    def create_alert(
        self,
        risk_record_id: UUID,
        title: str,
        message: str,
        severity: AlertSeverity,
        status: AlertStatus = AlertStatus.ACTIVE,
    ) -> AnomalyAlert:

        alert = AnomalyAlert(
            risk_record_id=risk_record_id,
            title=title,
            message=message,
            severity=severity,
            status=status,
        )

        
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        return alert

    # --------------------------------------------------
    # READ
    # --------------------------------------------------

    def get_alerts_by_risk_record(
        self,
        risk_record_id: UUID,
    ) -> list[AnomalyAlert]:

        stmt = (
            select(AnomalyAlert)
            .where(
                AnomalyAlert.risk_record_id == risk_record_id
            )
            .order_by(
                AnomalyAlert.created_at.desc()
            )
        )

        return list(
            self.db.scalars(stmt).all()
        )

    def get_active_alerts(
        self,
    ) -> list[AnomalyAlert]:

        stmt = (
            select(AnomalyAlert)
            .where(
                AnomalyAlert.status == AlertStatus.ACTIVE
            )
            .order_by(
                AnomalyAlert.created_at.desc()
            )
        )

        return list(
            self.db.scalars(stmt).all()
        )

    def get_alerts_by_severity(
        self,
        severity: AlertSeverity,
    ) -> list[AnomalyAlert]:

        stmt = (
            select(AnomalyAlert)
            .where(
                AnomalyAlert.severity == severity
            )
            .order_by(
                AnomalyAlert.created_at.desc()
            )
        )

        return list(
            self.db.scalars(stmt).all()
        )

    def get_alerts_by_tourist(
        self,
        tourist_id: str,
    ) -> list[AnomalyAlert]:

        stmt = (
            select(AnomalyAlert)
            .join(RiskRecord)
            .join(RiskRecord.snapshot)
            .where(
                RiskRecord.snapshot.has(
                    tourist_id=tourist_id
                )
            )
            .options(
                joinedload(
                    AnomalyAlert.risk_record
                ).joinedload(
                    RiskRecord.snapshot
                )
            )
            .order_by(
                AnomalyAlert.created_at.desc()
            )
        )

        return list(
            self.db.scalars(stmt).all()
        )

    def list_alerts(
        self,
        limit: int = 100,
        offset: int = 0,
    ) -> list[AnomalyAlert]:

        stmt = (
            select(AnomalyAlert)
            .order_by(
                AnomalyAlert.created_at.desc()
            )
            .offset(offset)
            .limit(limit)
        )

        return list(
            self.db.scalars(stmt).all()
        )
