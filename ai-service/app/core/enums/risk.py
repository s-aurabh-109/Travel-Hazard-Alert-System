"""Risk level enumeration."""

import enum


class RiskLevel(str, enum.Enum):
    """Composite risk classification levels."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"
