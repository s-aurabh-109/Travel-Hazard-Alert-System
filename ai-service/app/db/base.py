"""
SQLAlchemy declarative base.

Every ORM model in the project inherits from this ``Base`` class.
Import it as::

    from app.db.base import Base
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Declarative base for all AI-service ORM models."""
    pass
