import sqlite3
from typing import Annotated

from fastapi import Depends

from app.core.config import DATABASE_PATH


def get_db():
    db = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    try:
        yield db
    finally:
        db.close()


Database = Annotated[sqlite3.Connection, Depends(get_db)]
