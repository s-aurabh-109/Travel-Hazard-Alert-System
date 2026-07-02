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
DEFAULT_SEARCH_RADIUS_METERS = int(os.getenv("POLICE_SEARCH_RADIUS_METERS", 10000))
POLICE_CACHE_TTL_SECONDS = int(os.getenv("POLICE_CACHE_TTL_SECONDS", 1800))
POLICE_PROVIDER_FAILURE_CACHE_TTL_SECONDS = int(
    os.getenv("POLICE_PROVIDER_FAILURE_CACHE_TTL_SECONDS", 180)
)
POLICE_CACHE_KEY_PREFIX = "police_search:v4"
POLICE_CACHE_COORDINATE_PRECISION = 2
POLICE_RADIUS_FALLBACKS = (20000, 30000)


class PoliceProviderError(Exception):
    pass


def build_police_cache_key(
    latitude: float,
    longitude: float,
    limit: int,
    radius_meters: int,
):
    rounded_latitude = round(latitude, POLICE_CACHE_COORDINATE_PRECISION)
    rounded_longitude = round(longitude, POLICE_CACHE_COORDINATE_PRECISION)

    return (
        f"{POLICE_CACHE_KEY_PREFIX}:"
        f"{rounded_latitude}:"
        f"{rounded_longitude}:"
        f"{limit}:"
        f"{radius_meters}"
    )


def get_cached_police_response(
    latitude: float,
    longitude: float,
    limit: int,
    radius_meters: int,
):
    cache_key = build_police_cache_key(latitude, longitude, limit, radius_meters)

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


def set_cached_police_response(
    latitude: float,
    longitude: float,
    limit: int,
    radius_meters: int,
    response: dict,
    ttl_seconds: int = POLICE_CACHE_TTL_SECONDS,
):
    cache_key = build_police_cache_key(latitude, longitude, limit, radius_meters)

    try:
        redis_client.setex(
            cache_key,
            ttl_seconds,
            json.dumps(response),
        )
    except Exception:
        return


def get_radius_sequence(radius_meters: int):
    radii = [radius_meters]

    for fallback_radius in POLICE_RADIUS_FALLBACKS:
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
      node["amenity"="police"](around:{radius_meters},{latitude},{longitude});
      way["amenity"="police"](around:{radius_meters},{latitude},{longitude});
      relation["amenity"="police"](around:{radius_meters},{latitude},{longitude});
      node["police"="station"](around:{radius_meters},{latitude},{longitude});
      way["police"="station"](around:{radius_meters},{latitude},{longitude});
      relation["police"="station"](around:{radius_meters},{latitude},{longitude});
      node["office"="police"](around:{radius_meters},{latitude},{longitude});
      way["office"="police"](around:{radius_meters},{latitude},{longitude});
      relation["office"="police"](around:{radius_meters},{latitude},{longitude});
    );
    out body center;
    """


def fetch_police_from_overpass(latitude: float, longitude: float, radius_meters: int):
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
        raise PoliceProviderError(
            f"OpenStreetMap police lookup failed with HTTP {error.code}"
        ) from error
    except URLError as error:
        raise PoliceProviderError(
            "OpenStreetMap police lookup is unreachable right now"
        ) from error
    except TimeoutError as error:
        raise PoliceProviderError(
            "OpenStreetMap police lookup timed out"
        ) from error
    except OSError as error:
        raise PoliceProviderError(
            "OpenStreetMap police lookup failed before a response was received"
        ) from error
    except json.JSONDecodeError as error:
        raise PoliceProviderError(
            "OpenStreetMap police lookup returned an invalid response"
        ) from error


def build_address(tags: dict) -> str:
    if tags.get("addr:full"):
        return str(tags["addr:full"])

    address_parts = [
        tags.get("addr:housenumber"),
        tags.get("addr:street"),
        tags.get("addr:city"),
        tags.get("addr:state"),
        tags.get("addr:postcode"),
        tags.get("addr:country"),
    ]
    address = ", ".join(str(part) for part in address_parts if part)

    return address or "Address unavailable"


def get_tag_text(tags: dict, *keys: str):
    for key in keys:
        value = tags.get(key)

        if value:
            return str(value)

    return None


def get_element_coordinates(element: dict):
    if "lat" in element and "lon" in element:
        return element["lat"], element["lon"]

    center = element.get("center")
    if center and "lat" in center and "lon" in center:
        return center["lat"], center["lon"]

    return None


def normalize_overpass_police_station(
    element: dict,
    latitude: float,
    longitude: float,
):
    coordinates = get_element_coordinates(element)

    if coordinates is None:
        return None

    police_latitude, police_longitude = coordinates
    tags = element.get("tags", {})
    station_name = (
        get_tag_text(tags, "name", "official_name", "operator")
        or "Unnamed police station"
    )
    distance_km = calculate_distance_km(
        latitude,
        longitude,
        police_latitude,
        police_longitude,
    )

    return {
        "id": f"osm:{element['type']}:{element['id']}",
        "name": station_name,
        "latitude": police_latitude,
        "longitude": police_longitude,
        "address": build_address(tags),
        "phone": get_tag_text(tags, "phone", "contact:phone"),
        "distance_km": round(distance_km, 2),
    }


def fetch_and_normalize_nearest_police_stations(
    latitude: float,
    longitude: float,
    limit: int = 5,
    radius_meters: int = DEFAULT_SEARCH_RADIUS_METERS,
):
    overpass_response = fetch_police_from_overpass(
        latitude,
        longitude,
        radius_meters,
    )
    police_by_id = {}

    for element in overpass_response.get("elements", []):
        police_station = normalize_overpass_police_station(
            element,
            latitude,
            longitude,
        )

        if police_station is not None:
            police_by_id[police_station["id"]] = police_station

    nearest_police_stations = sorted(
        police_by_id.values(),
        key=lambda police_station: police_station["distance_km"],
    )[:limit]

    return {
        "source_latitude": latitude,
        "source_longitude": longitude,
        "radius_meters": radius_meters,
        "provider": "openstreetmap_overpass",
        "cache_status": "miss",
        "provider_status": "ok",
        "count": len(nearest_police_stations),
        "police_stations": nearest_police_stations,
    }


def build_provider_failure_response(
    latitude: float,
    longitude: float,
    radius_meters: int,
    message: str,
):
    return {
        "source_latitude": latitude,
        "source_longitude": longitude,
        "radius_meters": radius_meters,
        "provider": "openstreetmap_overpass",
        "cache_status": "miss",
        "provider_status": "unavailable",
        "provider_error": message,
        "count": 0,
        "police_stations": [],
    }


def get_nearest_police_stations(
    latitude: float,
    longitude: float,
    limit: int = 5,
    radius_meters: int = DEFAULT_SEARCH_RADIUS_METERS,
):
    last_response = None

    for search_radius in get_radius_sequence(radius_meters):
        cached_response = get_cached_police_response(
            latitude,
            longitude,
            limit,
            search_radius,
        )

        if cached_response is not None:
            last_response = cached_response

            if cached_response["count"] > 0:
                return cached_response

            continue

        try:
            response = fetch_and_normalize_nearest_police_stations(
                latitude,
                longitude,
                limit,
                search_radius,
            )
        except PoliceProviderError as error:
            response = build_provider_failure_response(
                latitude,
                longitude,
                search_radius,
                str(error),
            )
            set_cached_police_response(
                latitude,
                longitude,
                limit,
                search_radius,
                response,
                POLICE_PROVIDER_FAILURE_CACHE_TTL_SECONDS,
            )
            return response

        set_cached_police_response(
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


def get_nearest_police_stations_for_tourist(
    tourist_id: str,
    limit: int = 5,
    radius_meters: int = DEFAULT_SEARCH_RADIUS_METERS,
):
    tourist_location = get_tourist_location_from_redis(tourist_id)

    if tourist_location is None:
        return None

    return get_nearest_police_stations(
        tourist_location["latitude"],
        tourist_location["longitude"],
        limit,
        radius_meters,
    )
