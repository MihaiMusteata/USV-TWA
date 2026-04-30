import sqlite3

from fastapi import HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.schemas.auth import TokenResponse, UserAuth


def build_token_response(user_id: int, email: str) -> TokenResponse:
    return TokenResponse(access_token=create_access_token(user_id, email), email=email)


def register_user(user: UserAuth, db: sqlite3.Connection) -> TokenResponse:
    email = str(user.email).lower()
    existing_user = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email deja existent",
        )

    cursor = db.execute(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        (email, hash_password(user.password)),
    )
    db.commit()

    return build_token_response(cursor.lastrowid, email)


def authenticate_user(user: UserAuth, db: sqlite3.Connection) -> TokenResponse:
    email = str(user.email).lower()
    existing_user = db.execute(
        "SELECT id, email, password_hash FROM users WHERE email = ?",
        (email,),
    ).fetchone()

    if existing_user is None or not verify_password(user.password, existing_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email sau parola gresita",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return build_token_response(existing_user["id"], existing_user["email"])
