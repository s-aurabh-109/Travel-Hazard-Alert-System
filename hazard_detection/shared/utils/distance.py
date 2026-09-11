from math import atan2, cos, radians, sin, sqrt


EARTH_RADIUS_METERS = 6371000


def calculate_distance(point_a: tuple[float, float], point_b: tuple[float, float]) -> float:
    lat1, lon1 = point_a
    lat2, lon2 = point_b

    phi1 = radians(lat1)
    phi2 = radians(lat2)
    delta_phi = radians(lat2 - lat1)
    delta_lambda = radians(lon2 - lon1)

    haversine_value = (
        sin(delta_phi / 2) ** 2
        + cos(phi1)
        * cos(phi2)
        * sin(delta_lambda / 2) ** 2
    )

    central_angle = 2 * atan2(sqrt(haversine_value), sqrt(1 - haversine_value))
    return EARTH_RADIUS_METERS * central_angle
