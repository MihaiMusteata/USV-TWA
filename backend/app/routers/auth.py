from fastapi import APIRouter, status

from app.database.connection import Database
from app.schemas.auth import TokenResponse, UserAuth
from app.services import auth_service


router = APIRouter()


@router.post("/inregistrare", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserAuth, db: Database) -> TokenResponse:
    return auth_service.register_user(user, db)


@router.post("/autentificare", response_model=TokenResponse)
def login_user(user: UserAuth, db: Database) -> TokenResponse:
    return auth_service.authenticate_user(user, db)
