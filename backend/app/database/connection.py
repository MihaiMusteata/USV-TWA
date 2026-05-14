import sqlite3
from collections.abc import Sequence
from typing import Annotated, Any

from fastapi import Depends
from psycopg import Connection
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from app.core.config import DATABASE_PATH, DATABASE_URL, DB_POOL_MAX_SIZE, has_postgres_database


DatabaseRow = dict[str, Any] | sqlite3.Row


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
    if has_postgres_database():
        with get_postgres_pool().connection() as connection:
            session = DatabaseSession(connection, "postgres", from_pool=True)
            try:
                yield session
            except Exception:
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
