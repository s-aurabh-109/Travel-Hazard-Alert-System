from pydantic import BaseModel

class Location(BaseModel):
  tourist_id: str
  latitude: float
  longitude: float
  timestamp: int