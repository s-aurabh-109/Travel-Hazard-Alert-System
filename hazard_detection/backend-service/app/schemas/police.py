from typing import Optional

from pydantic import BaseModel


class PoliceStation(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    address: str
    phone: Optional[str] = None
    distance_km: float


class NearestPoliceStationsResponse(BaseModel):
    source_latitude: float
    source_longitude: float
    radius_meters: int
    provider: str
    cache_status: str
    provider_status: str
    provider_error: Optional[str] = None
    count: int
    police_stations: list[PoliceStation]
