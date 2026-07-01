from app.schemas.location import Location
from app.core.redis import redis_client


def process_location(location: Location):

    key = f"tourist:{location.tourist_id}"
    redis_client.hset(
        key,
        mapping={
            "latitude": location.latitude,
            "longitude": location.longitude,
            "timestamp": location.timestamp,
        },
    )

    redis_client.expire(key, 300)

    print()
    print("=== New Location ===")
    print(location)
    print("====================")

    return {
        "message": "Location received successfully"
    }