import argparse
import os
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from psycopg import connect


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app.database.schema import POSTGRES_SCHEMA_SQL, migrate_legacy_schema  # noqa: E402


def execute_postgres_script(db, sql: str) -> None:
    for statement in sql.split(";"):
        if statement.strip():
            db.execute(statement)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Migreaza datele din SQLite in baza Postgres folosita pe Vercel.",
    )
    parser.add_argument(
        "--sqlite-path",
        default=os.getenv("DATABASE_PATH", "./shopping.db"),
        help="Calea catre fisierul SQLite sursa.",
    )
    parser.add_argument(
        "--database-url",
        default=os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL"),
        help="Connection string Postgres destinatie.",
    )
    return parser.parse_args()


def fetch_sqlite_rows(db: sqlite3.Connection, table_name: str) -> list[sqlite3.Row]:
    table = db.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
        (table_name,),
    ).fetchone()
    if table is None:
        return []
    return db.execute(f"SELECT * FROM {table_name} ORDER BY id").fetchall()


def row_value(row: sqlite3.Row, key: str, default: Any = None) -> Any:
    return row[key] if key in row.keys() else default


def created_at_value(row: sqlite3.Row) -> Any:
    return row_value(row, "created_at") or datetime.now(timezone.utc)


def migrate(sqlite_path: str, database_url: str) -> tuple[int, int]:
    source = sqlite3.connect(sqlite_path)
    source.row_factory = sqlite3.Row
    source.execute("PRAGMA foreign_keys = OFF")
    migrate_legacy_schema(source)
    source.commit()

    users = fetch_sqlite_rows(source, "users")
    products = fetch_sqlite_rows(source, "products")

    with connect(database_url, prepare_threshold=None) as target:
        execute_postgres_script(target, POSTGRES_SCHEMA_SQL)

        for user in users:
            target.execute(
                """
                INSERT INTO users (id, email, password_hash, created_at)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    email = EXCLUDED.email,
                    password_hash = EXCLUDED.password_hash,
                    created_at = EXCLUDED.created_at
                """,
                (
                    user["id"],
                    user["email"],
                    user["password_hash"],
                    created_at_value(user),
                ),
            )

        for product in products:
            target.execute(
                """
                INSERT INTO products (id, name, quantity, category, bought, user_id, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    quantity = EXCLUDED.quantity,
                    category = EXCLUDED.category,
                    bought = EXCLUDED.bought,
                    user_id = EXCLUDED.user_id,
                    created_at = EXCLUDED.created_at
                """,
                (
                    product["id"],
                    product["name"],
                    product["quantity"],
                    product["category"],
                    bool(product["bought"]),
                    product["user_id"],
                    created_at_value(product),
                ),
            )

        target.execute(
            """
            SELECT setval(
                'users_id_seq',
                COALESCE((SELECT MAX(id) FROM users), 1),
                (SELECT COUNT(*) > 0 FROM users)
            )
            """,
        )
        target.execute(
            """
            SELECT setval(
                'products_id_seq',
                COALESCE((SELECT MAX(id) FROM products), 1),
                (SELECT COUNT(*) > 0 FROM products)
            )
            """,
        )
        target.commit()

    source.close()
    return len(users), len(products)


def main() -> None:
    args = parse_args()
    if not args.database_url:
        raise SystemExit("Seteaza DATABASE_URL sau foloseste --database-url.")
    if not Path(args.sqlite_path).exists():
        raise SystemExit(f"Fisier SQLite inexistent: {args.sqlite_path}")

    users_count, products_count = migrate(args.sqlite_path, args.database_url)
    print(f"Migrare finalizata: {users_count} utilizatori, {products_count} produse.")


if __name__ == "__main__":
    main()
