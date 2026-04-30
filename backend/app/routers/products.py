from fastapi import APIRouter, status

from app.database.connection import Database
from app.dependencies import CurrentUser
from app.schemas.product import Product, ProductCreate, ProductUpdate
from app.services import product_service


router = APIRouter(prefix="/produse")


@router.get("", response_model=list[Product])
def list_products(db: Database, current_user: CurrentUser) -> list[Product]:
    return product_service.list_products(db, current_user["id"])


@router.get("/{product_id}", response_model=Product)
def get_product(product_id: int, db: Database, current_user: CurrentUser) -> Product:
    return product_service.get_product(db, product_id, current_user["id"])


@router.post("", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(
    product: ProductCreate,
    db: Database,
    current_user: CurrentUser,
) -> Product:
    return product_service.create_product(db, product, current_user["id"])


@router.put("/{product_id}", response_model=Product)
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Database,
    current_user: CurrentUser,
) -> Product:
    return product_service.update_product(db, product_id, product, current_user["id"])


@router.patch("/{product_id}/cumpara", response_model=Product)
def mark_product_as_bought(product_id: int, db: Database, current_user: CurrentUser) -> Product:
    return product_service.mark_product_as_bought(db, product_id, current_user["id"])


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Database, current_user: CurrentUser) -> None:
    product_service.delete_product(db, product_id, current_user["id"])
    return None
