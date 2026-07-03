from enum import Enum

class RiskLevel(str, Enum):
    """
    Represents the severity level of a predicted hazard.
    """

    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"