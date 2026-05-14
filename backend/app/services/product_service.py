from fastapi import HTTPException, status

from app.database.connection import DatabaseRow, DatabaseSession
from app.schemas.product import Product, ProductCreate, ProductUpdate


def product_from_row(row: DatabaseRow) -> Product:
    return Product(
        id=row["id"],
        name=row["name"],
        quantity=row["quantity"],
        category=row["category"],
        bought=bool(row["bought"]),
        user_id=row["user_id"],
    )


def get_product_or_404(db: DatabaseSession, product_id: int, user_id: int) -> DatabaseRow:
    product = db.execute(
        """
        SELECT id, name, quantity, category, bought, user_id
        FROM products
        WHERE id = %s AND user_id = %s
        """,
        (product_id, user_id),
    ).fetchone()
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produs inexistent",
        )
    return product


def list_products(db: DatabaseSession, user_id: int) -> list[Product]:
    rows = db.execute(
        """
        SELECT id, name, quantity, category, bought, user_id
        FROM products
        WHERE user_id = %s
        ORDER BY bought ASC, id DESC
        """,
        (user_id,),
    ).fetchall()
    return [product_from_row(row) for row in rows]


def get_product(db: DatabaseSession, product_id: int, user_id: int) -> Product:
    return product_from_row(get_product_or_404(db, product_id, user_id))


def create_product(db: DatabaseSession, product: ProductCreate, user_id: int) -> Product:
    row = db.execute(
        """
        INSERT INTO products (name, quantity, category, bought, user_id)
        VALUES (%s, %s, %s, FALSE, %s)
        RETURNING id
        """,
        (product.name, product.quantity, product.category, user_id),
    ).fetchone()
    db.commit()
    return get_product(db, row["id"], user_id)


def update_product(
    db: DatabaseSession,
    product_id: int,
    product: ProductUpdate,
    user_id: int,
) -> Product:
    existing_product = get_product_or_404(db, product_id, user_id)
    updates = product.model_dump(exclude_unset=True, exclude_none=True)

    if updates:
        db.execute(
            """
            UPDATE products
            SET name = %s, quantity = %s, category = %s, bought = %s
            WHERE id = %s AND user_id = %s
            """,
            (
                updates.get("name", existing_product["name"]),
                updates.get("quantity", existing_product["quantity"]),
                updates.get("category", existing_product["category"]),
                bool(updates.get("bought", existing_product["bought"])),
                product_id,
                user_id,
            ),
        )
        db.commit()

    return get_product(db, product_id, user_id)


def mark_product_as_bought(db: DatabaseSession, product_id: int, user_id: int) -> Product:
    get_product_or_404(db, product_id, user_id)
    db.execute(
        "UPDATE products SET bought = TRUE WHERE id = %s AND user_id = %s",
        (product_id, user_id),
    )
    db.commit()
    return get_product(db, product_id, user_id)


def delete_product(db: DatabaseSession, product_id: int, user_id: int) -> None:
    get_product_or_404(db, product_id, user_id)
    db.execute(
        "DELETE FROM products WHERE id = %s AND user_id = %s",
        (product_id, user_id),
    )
    db.commit()
