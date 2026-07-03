from enum import Enum


class AlertStatus(str, Enum):
    """
    Represents the lifecycle state of an anomaly alert.
    """

    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"