from typing import Optional

from pydantic import BaseModel


class Hospital(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    address: str
    emergency_phone: Optional[str] = None
    distance_km: float


class NearestHospitalsResponse(BaseModel):
    source_latitude: float
    source_longitude: float
    radius_meters: int
    provider: str
    cache_status: str
    count: int
    hospitals: list[Hospital]
