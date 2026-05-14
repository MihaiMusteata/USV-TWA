import sqlite3
import logging
from collections.abc import Sequence
from typing import Annotated, Any

from fastapi import Depends, HTTPException, status
from psycopg import Connection
from psycopg import Error as PsycopgError
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool, PoolTimeout

from app.core.config import DATABASE_PATH, DATABASE_URL, DB_POOL_MAX_SIZE, has_postgres_database
from app.database.schema import ensure_database_initialized


DatabaseRow = dict[str, Any] | sqlite3.Row
logger = logging.getLogger(__name__)


def database_error_detail(error: BaseException) -> str:
    message = str(error).replace("\n", " ")
    return f"Baza de date nu este disponibila: {type(error).__name__}: {message[:240]}"


class DatabaseSession:
    def __init__(
        self,
        connection: Connection | sqlite3.Connection,
        dialect: str,
        from_pool: bool = False,
    ) -> None:
        self.connection = connection
        self.dialect = dialect
        self.from_pool = from_pool

    def execute(self, sql: str, params: Sequence[Any] = ()):
        if self.dialect == "sqlite":
            sql = sql.replace("%s", "?")
        return self.connection.execute(sql, params)

    def commit(self) -> None:
        self.connection.commit()

    def rollback(self) -> None:
        self.connection.rollback()

    def close(self) -> None:
        if not self.from_pool:
            self.connection.close()


_postgres_pool: ConnectionPool | None = None


def get_postgres_pool() -> ConnectionPool:
    global _postgres_pool

    if _postgres_pool is None:
        if DATABASE_URL is None:
            raise RuntimeError("DATABASE_URL is required for PostgreSQL connections.")
        _postgres_pool = ConnectionPool(
            conninfo=DATABASE_URL,
            min_size=0,
            max_size=DB_POOL_MAX_SIZE,
            kwargs={"row_factory": dict_row, "prepare_threshold": None},
            open=False,
        )
        _postgres_pool.open()

    return _postgres_pool


def get_db():
    try:
        ensure_database_initialized()
    except (PsycopgError, PoolTimeout, OSError, TimeoutError) as error:
        logger.exception("Database initialization failed")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=database_error_detail(error),
        ) from error

    if has_postgres_database():
        session: DatabaseSession | None = None
        try:
            with get_postgres_pool().connection() as connection:
                session = DatabaseSession(connection, "postgres", from_pool=True)
                yield session
        except (PsycopgError, PoolTimeout, OSError, TimeoutError) as error:
            logger.exception("Database connection failed")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=database_error_detail(error),
            ) from error
        except Exception:
            if session is not None:
                session.rollback()
            raise
        return

    db = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    db.row_factory = sqlite3.Row
    session = DatabaseSession(db, "sqlite")
    session.execute("PRAGMA foreign_keys = ON")
    try:
        yield session
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


Database = Annotated[DatabaseSession, Depends(get_db)]
