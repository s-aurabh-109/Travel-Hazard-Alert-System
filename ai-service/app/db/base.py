from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy ORM models.

    Every database model in the project will inherit from this class.
    SQLAlchemy uses it to collect metadata and map Python classes
    to PostgreSQL tables.
    """
    pass