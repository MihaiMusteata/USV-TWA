import sqlite3

from fastapi import APIRouter, HTTPException, status
from psycopg import Error as PsycopgError
from psycopg import connect

from app.core.config import DATABASE_PATH, DATABASE_URL, has_postgres_database
from app.database.schema import ensure_database_initialized


router = APIRouter()


@router.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/db-healthz")
def db_healthz() -> dict[str, str]:
    try:
        ensure_database_initialized()
        if has_postgres_database():
            if DATABASE_URL is None:
                raise RuntimeError("DATABASE_URL lipseste.")
            with connect(DATABASE_URL, prepare_threshold=None) as db:
                db.execute("SELECT 1").fetchone()
            return {"status": "ok", "database": "postgres"}

        with sqlite3.connect(DATABASE_PATH) as db:
            db.execute("SELECT 1").fetchone()
        return {"status": "ok", "database": "sqlite"}
    except (PsycopgError, OSError, sqlite3.Error, RuntimeError) as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"{type(error).__name__}: {str(error)[:240]}",
        ) from error
