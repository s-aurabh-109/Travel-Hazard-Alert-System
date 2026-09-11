"""Alert status enumeration."""

import enum


class AlertStatus(str, enum.Enum):
    """Lifecycle status of an anomaly alert."""
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"
    EXPIRED = "EXPIRED"
