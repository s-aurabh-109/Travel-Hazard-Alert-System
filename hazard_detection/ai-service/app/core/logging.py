"""
Logging configuration for the AI Service.

Provides a structured JSON-like formatter that plays nicely
with Docker log drivers and centralised log aggregators.
"""

import logging
import sys


class StructuredFormatter(logging.Formatter):
    """Simple key=value formatter for structured log output."""

    def format(self, record: logging.LogRecord) -> str:
        log_message = super().format(record)
        return (
            f"level={record.levelname} "
            f"logger={record.name} "
            f"msg=\"{log_message}\""
        )


def setup_logging(level: str | None = None) -> logging.Logger:
    """
    Configure and return the application logger.

    Parameters
    ----------
    level : str, optional
        Override the log level (default: from LOG_LEVEL env var or INFO).
    """
    if level is None:
        import os
        level = os.getenv("LOG_LEVEL", "INFO")

    log_level = getattr(logging, level.upper(), logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredFormatter())

    logger = logging.getLogger("ai_service")
    logger.setLevel(log_level)

    # Avoid duplicate handlers on repeated calls
    if not logger.handlers:
        logger.addHandler(handler)

    return logger
