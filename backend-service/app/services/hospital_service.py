import json
import os
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from app.core.redis import redis_client
from shared.utils.distance import calculate_distance


OVERPASS_API_URL = os.getenv(
    "OVERPASS_API_URL",
    "https://overpass-api.de/api/interpreter",
)
OVERPASS_TIMEOUT_SECONDS = int(os.getenv("OVERPASS_TIMEOUT_SECONDS", 25))
DEFAULT_SEARCH_RADIUS_METERS = int(os.getenv("HOSPITAL_SEARCH_RADIUS_METERS", 10000))
HOSPITAL_CACHE_TTL_SECONDS = int(os.getenv("HOSPITAL_CACHE_TTL_SECONDS", 1800))
HOSPITAL_CACHE_KEY_PREFIX = "hospital_search"
HOSPITAL_CACHE_COORDINATE_PRECISION = 2
HOSPITAL_RADIUS_FALLBACKS = (20000, 30000, 50000)


class HospitalProviderError(Exception):
    pass


def build_hospital_cache_key(
    latitude: float,
    longitude: float,
    limit: int,
    radius_meters: int,
):
    rounded_latitude = round(latitude, HOSPITAL_CACHE_COORDINATE_PRECISION)
    rounded_longitude = round(longitude, HOSPITAL_CACHE_COORDINATE_PRECISION)

    return (
        f"{HOSPITAL_CACHE_KEY_PREFIX}:"
        f"{rounded_latitude}:"
        f"{rounded_longitude}:"
        f"{limit}:"
        f"{radius_meters}"
    )


def get_cached_hospital_response(
    latitude: float,
    longitude: float,
    limit: int,
    radius_meters: int,
):
    cache_key = build_hospital_cache_key(latitude, longitude, limit, radius_meters)

    try:
        cached_response = redis_client.get(cache_key)
    except Exception:
        return None

    if not cached_response:
        return None

    try:
        response = json.loads(cached_response)
    except json.JSONDecodeError:
        return None

    response["cache_status"] = "hit"
    return response


def set_cached_hospital_response(
    latitude: float,
    longitude: float,
    limit: int,
    radius_meters: int,
    response: dict,
):
    cache_key = build_hospital_cache_key(latitude, longitude, limit, radius_meters)

    try:
        redis_client.setex(
            cache_key,
            HOSPITAL_CACHE_TTL_SECONDS,
            json.dumps(response),
        )
    except Exception:
        return


def get_radius_sequence(radius_meters: int):
    radii = [radius_meters]

    for fallback_radius in HOSPITAL_RADIUS_FALLBACKS:
        if fallback_radius > radius_meters:
            radii.append(fallback_radius)

    return radii


def calculate_distance_km(
    source_latitude: float,
    source_longitude: float,
    target_latitude: float,
    target_longitude: float,
) -> float:
    distance_meters = calculate_distance(
        (source_latitude, source_longitude),
        (target_latitude, target_longitude),
    )
    return distance_meters / 1000


def build_overpass_query(latitude: float, longitude: float, radius_meters: int) -> str:
    return f"""
    [out:json][timeout:{OVERPASS_TIMEOUT_SECONDS}];
    (
      node["amenity"="hospital"](around:{radius_meters},{latitude},{longitude});
      way["amenity"="hospital"](around:{radius_meters},{latitude},{longitude});
      relation["amenity"="hospital"](around:{radius_meters},{latitude},{longitude});
      node["healthcare"="hospital"](around:{radius_meters},{latitude},{longitude});
      way["healthcare"="hospital"](around:{radius_meters},{latitude},{longitude});
      relation["healthcare"="hospital"](around:{radius_meters},{latitude},{longitude});
    );
    out body center;
    """


def fetch_hospitals_from_overpass(latitude: float, longitude: float, radius_meters: int):
    request_body = urlencode(
        {
            "data": build_overpass_query(latitude, longitude, radius_meters),
        }
    ).encode("utf-8")
    request = Request(
        OVERPASS_API_URL,
        data=request_body,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "tourist-safety-backend/1.0",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=OVERPASS_TIMEOUT_SECONDS) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        raise HospitalProviderError(
            f"OpenStreetMap hospital lookup failed with HTTP {error.code}"
        ) from error
    except URLError as error:
        raise HospitalProviderError(
            "OpenStreetMap hospital lookup is unreachable right now"
        ) from error
    except json.JSONDecodeError as error:
        raise HospitalProviderError(
            "OpenStreetMap hospital lookup returned an invalid response"
        ) from error


def build_address(tags: dict) -> str:
    if tags.get("addr:full"):
        return tags["addr:full"]

    address_parts = [
        tags.get("addr:housenumber"),
        tags.get("addr:street"),
        tags.get("addr:city"),
        tags.get("addr:state"),
        tags.get("addr:postcode"),
        tags.get("addr:country"),
    ]
    address = ", ".join(part for part in address_parts if part)

    return address or "Address unavailable"


def get_element_coordinates(element: dict):
    if "lat" in element and "lon" in element:
        return element["lat"], element["lon"]

    center = element.get("center")
    if center and "lat" in center and "lon" in center:
        return center["lat"], center["lon"]

    return None


def normalize_overpass_hospital(element: dict, latitude: float, longitude: float):
    coordinates = get_element_coordinates(element)

    if coordinates is None:
        return None

    hospital_latitude, hospital_longitude = coordinates
    tags = element.get("tags", {})
    hospital_name = (
        tags.get("name")
        or tags.get("official_name")
        or tags.get("operator")
        or "Unnamed hospital"
    )
    distance_km = calculate_distance_km(
        latitude,
        longitude,
        hospital_latitude,
        hospital_longitude,
    )

    return {
        "id": f"osm:{element['type']}:{element['id']}",
        "name": hospital_name,
        "latitude": hospital_latitude,
        "longitude": hospital_longitude,
        "address": build_address(tags),
        "emergency_phone": (
            tags.get("emergency:phone")
            or tags.get("phone")
            or tags.get("contact:phone")
        ),
        "distance_km": round(distance_km, 2),
    }


def fetch_and_normalize_nearest_hospitals(
    latitude: float,
    longitude: float,
    limit: int = 5,
    radius_meters: int = DEFAULT_SEARCH_RADIUS_METERS,
):
    overpass_response = fetch_hospitals_from_overpass(
        latitude,
        longitude,
        radius_meters,
    )
    hospitals_by_id = {}

    for element in overpass_response.get("elements", []):
        hospital = normalize_overpass_hospital(
            element,
            latitude,
            longitude,
        )

        if hospital is not None:
            hospitals_by_id[hospital["id"]] = hospital

    nearest_hospitals = sorted(
        hospitals_by_id.values(),
        key=lambda hospital: hospital["distance_km"],
    )[:limit]

    return {
        "source_latitude": latitude,
        "source_longitude": longitude,
        "radius_meters": radius_meters,
        "provider": "openstreetmap_overpass",
        "cache_status": "miss",
        "count": len(nearest_hospitals),
        "hospitals": nearest_hospitals,
    }


def get_nearest_hospitals(
    latitude: float,
    longitude: float,
    limit: int = 5,
    radius_meters: int = DEFAULT_SEARCH_RADIUS_METERS,
):
    last_response = None

    for search_radius in get_radius_sequence(radius_meters):
        cached_response = get_cached_hospital_response(
            latitude,
            longitude,
            limit,
            search_radius,
        )

        if cached_response is not None:
            return cached_response

        response = fetch_and_normalize_nearest_hospitals(
            latitude,
            longitude,
            limit,
            search_radius,
        )
        set_cached_hospital_response(
            latitude,
            longitude,
            limit,
            search_radius,
            response,
        )
        last_response = response

        if response["count"] > 0:
            return response

    return last_response


def get_tourist_location_from_redis(tourist_id: str):
    tourist_location = redis_client.hgetall(f"tourist:{tourist_id}")

    if not tourist_location:
        return None

    return {
        "latitude": float(tourist_location["latitude"]),
        "longitude": float(tourist_location["longitude"]),
        "timestamp": int(tourist_location["timestamp"]),
    }


def get_nearest_hospitals_for_tourist(
    tourist_id: str,
    limit: int = 5,
    radius_meters: int = DEFAULT_SEARCH_RADIUS_METERS,
):
    tourist_location = get_tourist_location_from_redis(tourist_id)

    if tourist_location is None:
        return None

    return get_nearest_hospitals(
        tourist_location["latitude"],
        tourist_location["longitude"],
        limit,
        radius_meters,
    )
