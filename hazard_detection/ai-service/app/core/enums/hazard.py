"""Hazard type enumeration."""

import enum


class HazardType(str, enum.Enum):
    """Types of natural hazards tracked by the system."""
    EARTHQUAKE = "EARTHQUAKE"
    FLOOD = "FLOOD"
    LANDSLIDE = "LANDSLIDE"
    CYCLONE = "CYCLONE"
    DROUGHT = "DROUGHT"
    TSUNAMI = "TSUNAMI"
    AVALANCHE = "AVALANCHE"
    WILDFIRE = "WILDFIRE"
