import uuid
from typing import List, Optional
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.repositories.base_repository import BaseRepository
from app.models.danger_zone import DangerZone
from app.core.enums.hazard import HazardType
from app.core.enums.alert_severity import AlertSeverity

class DangerZoneRepository(BaseRepository[DangerZone]):
    def __init__(self, db: Session):
        super().__init__(db=db, model=DangerZone)

    def create_danger_zone(
        self, 
        name: str, 
        latitude: float, 
        longitude: float, 
        radius_km: float, 
        hazard_type: HazardType, 
        severity: AlertSeverity, 
        description: Optional[str] = None
    ) -> DangerZone:
        zone = DangerZone(
            name=name,
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            hazard_type=hazard_type,
            severity=severity,
            description=description
        )
        self.db.add(zone)
        self.db.commit()
        self.db.refresh(zone)
        return zone

    def get_active_zones(self) -> List[DangerZone]:
        stmt = select(DangerZone).where(DangerZone.is_active == True)
        return list(self.db.scalars(stmt).all())

    def get_zones_by_hazard(self, hazard_type: HazardType) -> List[DangerZone]:
        stmt = select(DangerZone).where(DangerZone.hazard_type == hazard_type)
        return list(self.db.scalars(stmt).all())

    def list_zones(self, limit: int = 100, offset: int = 0) -> List[DangerZone]:
        stmt = select(DangerZone).limit(limit).offset(offset)
        return list(self.db.scalars(stmt).all())

    def deactivate_zone(self, zone_id: uuid.UUID) -> bool:
        zone = self.db.get(DangerZone, zone_id)
        if zone:
            zone.is_active = False
            self.db.commit()
            return True
        return False
