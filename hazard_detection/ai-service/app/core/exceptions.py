"""
Custom exceptions for the AI Service.

All service-level errors inherit from AIServiceException so that
the global exception handler in main.py can catch them uniformly.
"""


class AIServiceException(Exception):
    """Base exception for all AI Service errors."""

    def __init__(
        self,
        message: str = "An internal AI-service error occurred.",
        status_code: int = 500,
    ):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class RiskAnalysisError(AIServiceException):
    """Raised when a risk-analysis pipeline fails."""

    def __init__(self, message: str = "Risk analysis failed."):
        super().__init__(message=message, status_code=500)


class GeofenceError(AIServiceException):
    """Raised when a geofence check encounters an error."""

    def __init__(self, message: str = "Geofence check failed."):
        super().__init__(message=message, status_code=500)


class AnomalyDetectionError(AIServiceException):
    """Raised when anomaly detection encounters an error."""

    def __init__(self, message: str = "Anomaly detection failed."):
        super().__init__(message=message, status_code=500)


class NotFoundError(AIServiceException):
    """Raised when a requested resource is not found."""

    def __init__(self, message: str = "Resource not found."):
        super().__init__(message=message, status_code=404)


class ValidationError(AIServiceException):
    """Raised when input validation fails."""

    def __init__(self, message: str = "Validation error."):
        super().__init__(message=message, status_code=422)
