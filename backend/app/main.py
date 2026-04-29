from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
import os
import sqlite3
from typing import Annotated, Any

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field, field_validator


DATABASE_PATH = os.getenv("DATABASE_PATH", "./shopping.db")
SECRET_KEY = os.getenv("SECRET_KEY", "local-dev-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/autentificare")


class UserAuth(BaseModel):
    email: EmailStr
    parola: str = Field(min_length=8)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: EmailStr


class ProductBase(BaseModel):
    nume: str = Field(min_length=1)
    cantitate: int = Field(ge=1)
    categorie: str = Field(min_length=1)

    @field_validator("nume", "categorie")
    @classmethod
    def strip_and_validate_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Campul nu poate fi gol.")
        return cleaned


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    nume: str | None = Field(default=None, min_length=1)
    cantitate: int | None = Field(default=None, ge=1)
    categorie: str | None = Field(default=None, min_length=1)
    cumparat: bool | None = None

    @field_validator("nume", "categorie")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Campul nu poate fi gol.")
        return cleaned


class Product(ProductBase):
    id: int
    cumparat: bool
    utilizator_id: int


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(title="Lista de cumparaturi API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def initialize_database() -> None:
    directory = os.path.dirname(DATABASE_PATH)
    if directory:
        os.makedirs(directory, exist_ok=True)

    with sqlite3.connect(DATABASE_PATH) as db:
        db.execute("PRAGMA foreign_keys = ON")
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS utilizatori (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                parola_hash TEXT NOT NULL,
                creat_la TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS produse (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nume TEXT NOT NULL,
                cantitate INTEGER NOT NULL CHECK (cantitate >= 1),
                categorie TEXT NOT NULL,
                cumparat INTEGER NOT NULL DEFAULT 0 CHECK (cumparat IN (0, 1)),
                utilizator_id INTEGER NOT NULL,
                creat_la TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (utilizator_id) REFERENCES utilizatori(id) ON DELETE CASCADE
            );
            """
        )


def get_db():
    db = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    try:
        yield db
    finally:
        db.close()


Database = Annotated[sqlite3.Connection, Depends(get_db)]


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(user_id: int, email: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload: dict[str, Any] = {"sub": str(user_id), "email": email, "exp": expires_at}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def token_response(user_id: int, email: str) -> TokenResponse:
    return TokenResponse(access_token=create_access_token(user_id, email), email=email)


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Database,
) -> sqlite3.Row:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalid",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise unauthorized

    user = db.execute(
        "SELECT id, email FROM utilizatori WHERE id = ?",
        (user_id,),
    ).fetchone()

    if user is None:
        raise unauthorized
    return user


CurrentUser = Annotated[sqlite3.Row, Depends(get_current_user)]


def product_from_row(row: sqlite3.Row) -> Product:
    return Product(
        id=row["id"],
        nume=row["nume"],
        cantitate=row["cantitate"],
        categorie=row["categorie"],
        cumparat=bool(row["cumparat"]),
        utilizator_id=row["utilizator_id"],
    )


def get_product_or_404(db: sqlite3.Connection, product_id: int, user_id: int) -> sqlite3.Row:
    product = db.execute(
        """
        SELECT id, nume, cantitate, categorie, cumparat, utilizator_id
        FROM produse
        WHERE id = ? AND utilizator_id = ?
        """,
        (product_id, user_id),
    ).fetchone()
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produs inexistent",
        )
    return product


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/inregistrare", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserAuth, db: Database) -> TokenResponse:
    email = str(user.email).lower()
    existing_user = db.execute("SELECT id FROM utilizatori WHERE email = ?", (email,)).fetchone()
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email deja existent",
        )

    cursor = db.execute(
        "INSERT INTO utilizatori (email, parola_hash) VALUES (?, ?)",
        (email, hash_password(user.parola)),
    )
    db.commit()

    return token_response(cursor.lastrowid, email)


@app.post("/autentificare", response_model=TokenResponse)
def login_user(user: UserAuth, db: Database) -> TokenResponse:
    email = str(user.email).lower()
    existing_user = db.execute(
        "SELECT id, email, parola_hash FROM utilizatori WHERE email = ?",
        (email,),
    ).fetchone()

    if existing_user is None or not verify_password(user.parola, existing_user["parola_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email sau parola gresita",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token_response(existing_user["id"], existing_user["email"])


@app.get("/produse", response_model=list[Product])
def list_products(db: Database, current_user: CurrentUser) -> list[Product]:
    rows = db.execute(
        """
        SELECT id, nume, cantitate, categorie, cumparat, utilizator_id
        FROM produse
        WHERE utilizator_id = ?
        ORDER BY cumparat ASC, id DESC
        """,
        (current_user["id"],),
    ).fetchall()
    return [product_from_row(row) for row in rows]


@app.get("/produse/{product_id}", response_model=Product)
def get_product(product_id: int, db: Database, current_user: CurrentUser) -> Product:
    return product_from_row(get_product_or_404(db, product_id, current_user["id"]))


@app.post("/produse", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(
    product: ProductCreate,
    db: Database,
    current_user: CurrentUser,
) -> Product:
    cursor = db.execute(
        """
        INSERT INTO produse (nume, cantitate, categorie, cumparat, utilizator_id)
        VALUES (?, ?, ?, 0, ?)
        """,
        (product.nume, product.cantitate, product.categorie, current_user["id"]),
    )
    db.commit()
    created = get_product_or_404(db, cursor.lastrowid, current_user["id"])
    return product_from_row(created)


@app.put("/produse/{product_id}", response_model=Product)
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Database,
    current_user: CurrentUser,
) -> Product:
    get_product_or_404(db, product_id, current_user["id"])
    updates = product.model_dump(exclude_unset=True, exclude_none=True)

    if updates:
        columns = ", ".join(f"{field} = ?" for field in updates)
        values = [int(value) if field == "cumparat" else value for field, value in updates.items()]
        db.execute(
            f"UPDATE produse SET {columns} WHERE id = ? AND utilizator_id = ?",
            (*values, product_id, current_user["id"]),
        )
        db.commit()

    updated = get_product_or_404(db, product_id, current_user["id"])
    return product_from_row(updated)


@app.patch("/produse/{product_id}/cumpara", response_model=Product)
def mark_product_as_bought(product_id: int, db: Database, current_user: CurrentUser) -> Product:
    get_product_or_404(db, product_id, current_user["id"])
    db.execute(
        "UPDATE produse SET cumparat = 1 WHERE id = ? AND utilizator_id = ?",
        (product_id, current_user["id"]),
    )
    db.commit()
    updated = get_product_or_404(db, product_id, current_user["id"])
    return product_from_row(updated)


@app.delete("/produse/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Database, current_user: CurrentUser) -> None:
    get_product_or_404(db, product_id, current_user["id"])
    db.execute(
        "DELETE FROM produse WHERE id = ? AND utilizator_id = ?",
        (product_id, current_user["id"]),
    )
    db.commit()
    return None
