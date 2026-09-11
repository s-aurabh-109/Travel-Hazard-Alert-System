from fastapi import APIRouter

from app.schemas.location import Location
from app.services.location_service import process_location

router = APIRouter()


@router.post("/")
def receive_location(location: Location):

    return process_location(location)