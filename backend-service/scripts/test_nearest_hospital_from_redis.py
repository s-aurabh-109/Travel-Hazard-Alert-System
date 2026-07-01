import json
import os
import sys
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen

import redis
from dotenv import load_dotenv


BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

load_dotenv(BACKEND_ROOT / ".env")


def main():
    tourist_id = sys.argv[1] if len(sys.argv) > 1 else "tourist_001"
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    radius_meters = int(
        sys.argv[3]
        if len(sys.argv) > 3
        else os.getenv("HOSPITAL_SEARCH_RADIUS_METERS", 5000)
    )

    redis_client = redis.Redis(
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        decode_responses=True,
    )

    location = redis_client.hgetall(f"tourist:{tourist_id}")

    if not location:
        print(f"No active Redis location found for tourist_id '{tourist_id}'.")
        print("Send a location first with POST /location/.")
        return

    query = urlencode(
        {
            "latitude": location["latitude"],
            "longitude": location["longitude"],
            "limit": limit,
            "radius_meters": radius_meters,
        }
    )
    api_url = os.getenv(
        "HOSPITAL_API_URL",
        "http://localhost:8000/hospitals/nearest",
    )

    with urlopen(f"{api_url}?{query}", timeout=10) as response:
        payload = json.loads(response.read().decode("utf-8"))

    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
