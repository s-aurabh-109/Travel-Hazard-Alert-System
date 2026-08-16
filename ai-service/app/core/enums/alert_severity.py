"""Alert severity enumeration."""

import enum


class AlertSeverity(str, enum.Enum):
    """Severity levels for alerts and danger zones."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"
