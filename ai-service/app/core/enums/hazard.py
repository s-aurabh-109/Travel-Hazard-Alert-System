from enum import Enum


class HazardType(str, Enum):
    """
    Supported hazard categories analyzed by the AI service.
    """

    EARTHQUAKE = "EARTHQUAKE"
    FLOOD = "FLOOD"
    LANDSLIDE = "LANDSLIDE"
    CYCLONE = "CYCLONE"
    DROUGHT = "DROUGHT"