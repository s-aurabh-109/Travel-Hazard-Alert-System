from enum import Enum


class AlertSeverity(str, Enum):
    """
    Represents the severity of an anomaly alert.
    """

    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"