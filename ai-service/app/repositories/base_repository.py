from typing import Generic, Type, TypeVar
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session


T = TypeVar("T")


class BaseRepository(Generic[T]):
    """
    Base repository providing common database
    operations shared across repositories.
    """

    def __init__(
        self,
        db: Session,
        model: Type[T],
    ):
        self.db = db
        self.model = model

    # --------------------------------------------------
    # COMMON SESSION HELPERS
    # --------------------------------------------------

    def add(
        self,
        instance: T,
    ) -> None:
        """
        Add an ORM instance to the current session.
        """

        self.db.add(instance)

    def commit(self) -> None:
        """
        Commit the current transaction.
        """

        try:
            self.db.commit()

        except SQLAlchemyError:
            self.db.rollback()
            raise

    def flush(self) -> None:
        """
        Flush pending changes to the database
        without committing the transaction.
        """

        self.db.flush()

    def refresh(
        self,
        instance: T,
    ) -> None:
        """
        Refresh an ORM instance from the database.
        """

        self.db.refresh(instance)

    # --------------------------------------------------
    # COMMON READ OPERATIONS
    # --------------------------------------------------

    def get_by_id(
        self,
        entity_id: UUID,
    ) -> T | None:
        """
        Returns an entity by its primary key.
        """

        return self.db.get(
            self.model,
            entity_id,
        )

    def exists(
        self,
        entity_id: UUID,
    ) -> bool:
        """
        Checks whether an entity exists.
        """

        return self.get_by_id(entity_id) is not None

    # --------------------------------------------------
    # COMMON DELETE
    # --------------------------------------------------

    def delete(
        self,
        entity_id: UUID,
    ) -> bool:
        """
        Deletes an entity by its primary key.

        Returns:
            True if deleted successfully,
            False if the entity does not exist.
        """

        instance = self.get_by_id(entity_id)

        if instance is None:
            return False

        self.db.delete(instance)
        self.commit()

        return True