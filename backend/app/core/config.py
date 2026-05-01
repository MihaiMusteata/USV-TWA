import os


DATABASE_PATH = os.getenv("DATABASE_PATH", "./shopping.db")
SECRET_KEY = os.getenv("SECRET_KEY", "local-dev-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

DEFAULT_CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]


def parse_cors_origins() -> list[str]:
    raw_origins = os.getenv("CORS_ORIGINS")
    if not raw_origins:
        return DEFAULT_CORS_ORIGINS

    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    return origins or DEFAULT_CORS_ORIGINS


CORS_ORIGINS = parse_cors_origins()
CORS_ALLOW_CREDENTIALS = "*" not in CORS_ORIGINS
