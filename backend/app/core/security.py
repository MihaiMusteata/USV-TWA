from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt
from jose.exceptions import JWTError
from passlib.context import CryptContext

from app.core.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    REFRESH_SECRET_KEY,
    REFRESH_TOKEN_ALGORITHM,
    REFRESH_TOKEN_EXPIRE_DAYS,
    SECRET_KEY,
)


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_jwt_token(
    user_id: int,
    email: str,
    expires_delta: timedelta,
    token_type: str,
    secret_key: str,
    algorithm: str,
) -> str:
    issued_at = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "email": email,
        "type": token_type,
        "iat": issued_at,
        "exp": issued_at + expires_delta,
    }
    return jwt.encode(payload, secret_key, algorithm=algorithm)


def create_access_token(user_id: int, email: str) -> str:
    return create_jwt_token(
        user_id=user_id,
        email=email,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        token_type=ACCESS_TOKEN_TYPE,
        secret_key=SECRET_KEY,
        algorithm=ALGORITHM,
    )


def create_refresh_token(user_id: int, email: str) -> str:
    return create_jwt_token(
        user_id=user_id,
        email=email,
        expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        token_type=REFRESH_TOKEN_TYPE,
        secret_key=REFRESH_SECRET_KEY,
        algorithm=REFRESH_TOKEN_ALGORITHM,
    )


def decode_jwt_token(
    token: str,
    expected_type: str,
    secret_key: str,
    algorithm: str,
) -> dict[str, Any]:
    payload = jwt.decode(token, secret_key, algorithms=[algorithm])
    if payload.get("type") != expected_type:
        raise JWTError("Token type invalid")
    return payload


def decode_access_token(token: str) -> dict[str, Any]:
    return decode_jwt_token(
        token=token,
        expected_type=ACCESS_TOKEN_TYPE,
        secret_key=SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_refresh_token(token: str) -> dict[str, Any]:
    return decode_jwt_token(
        token=token,
        expected_type=REFRESH_TOKEN_TYPE,
        secret_key=REFRESH_SECRET_KEY,
        algorithm=REFRESH_TOKEN_ALGORITHM,
    )
