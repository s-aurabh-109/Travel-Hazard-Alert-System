"""
Geospatial utility functions.

Provides distance calculations used across hazard services,
geofence checks, and anomaly detection.
"""

import math


def haversine_distance(
    lat1: float, lon1: float,
    lat2: float, lon2: float,
) -> float:
    """
    Calculate the great-circle distance between two points
    on Earth using the Haversine formula.

    Parameters
    ----------
    lat1, lon1 : float
        Latitude and longitude of the first point (in degrees).
    lat2, lon2 : float
        Latitude and longitude of the second point (in degrees).

    Returns
    -------
    float
        Distance in **kilometers**.
    """
    R = 6371.0  # Earth's mean radius in km

    lat1_r = math.radians(lat1)
    lat2_r = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c
