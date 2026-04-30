import sqlite3
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.core.config import ALGORITHM, SECRET_KEY
from app.database.connection import Database


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/autentificare")


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
        "SELECT id, email FROM users WHERE id = ?",
        (user_id,),
    ).fetchone()

    if user is None:
        raise unauthorized
    return user


CurrentUser = Annotated[sqlite3.Row, Depends(get_current_user)]
