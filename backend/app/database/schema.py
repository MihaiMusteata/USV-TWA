import os
import sqlite3

from app.core.config import DATABASE_PATH


CREATE_SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    category TEXT NOT NULL,
    bought INTEGER NOT NULL DEFAULT 0 CHECK (bought IN (0, 1)),
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
"""

ALLOWED_SQL_IDENTIFIERS = {
    "users",
    "products",
    "parola_hash",
    "password_hash",
    "creat_la",
    "created_at",
    "nume",
    "name",
    "cantitate",
    "quantity",
    "categorie",
    "category",
    "cumparat",
    "bought",
    "utilizator_id",
    "user_id",
}


def quote_identifier(identifier: str) -> str:
    if identifier not in ALLOWED_SQL_IDENTIFIERS:
        raise ValueError("Identificator SQL invalid.")
    return f'"{identifier}"'


def initialize_database() -> None:
    directory = os.path.dirname(DATABASE_PATH)
    if directory:
        os.makedirs(directory, exist_ok=True)

    with sqlite3.connect(DATABASE_PATH) as db:
        db.execute("PRAGMA foreign_keys = OFF")
        migrate_legacy_schema(db)
        db.executescript(CREATE_SCHEMA_SQL)
        db.commit()
        db.execute("PRAGMA foreign_keys = ON")


def table_exists(db: sqlite3.Connection, table_name: str) -> bool:
    table = db.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
        (table_name,),
    ).fetchone()
    return table is not None


def table_columns(db: sqlite3.Connection, table_name: str) -> set[str]:
    table_identifier = quote_identifier(table_name)
    return {row[1] for row in db.execute(f"PRAGMA table_info({table_identifier})").fetchall()}


def rename_column_if_needed(
    db: sqlite3.Connection,
    table_name: str,
    old_column: str,
    new_column: str,
) -> None:
    columns = table_columns(db, table_name)
    if old_column in columns and new_column not in columns:
        table_identifier = quote_identifier(table_name)
        old_column_identifier = quote_identifier(old_column)
        new_column_identifier = quote_identifier(new_column)
        db.execute(
            f"ALTER TABLE {table_identifier} "
            f"RENAME COLUMN {old_column_identifier} TO {new_column_identifier}",
        )


def migrate_legacy_schema(db: sqlite3.Connection) -> None:
    if table_exists(db, "utilizatori") and not table_exists(db, "users"):
        db.execute("ALTER TABLE utilizatori RENAME TO users")

    if table_exists(db, "produse") and not table_exists(db, "products"):
        db.execute("ALTER TABLE produse RENAME TO products")

    if table_exists(db, "users"):
        rename_column_if_needed(db, "users", "parola_hash", "password_hash")
        rename_column_if_needed(db, "users", "creat_la", "created_at")

    if table_exists(db, "products"):
        rename_column_if_needed(db, "products", "nume", "name")
        rename_column_if_needed(db, "products", "cantitate", "quantity")
        rename_column_if_needed(db, "products", "categorie", "category")
        rename_column_if_needed(db, "products", "cumparat", "bought")
        rename_column_if_needed(db, "products", "utilizator_id", "user_id")
        rename_column_if_needed(db, "products", "creat_la", "created_at")
