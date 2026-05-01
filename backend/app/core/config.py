import os


def read_int_env(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None:
        return default

    try:
        return int(value)
    except ValueError:
        return default


DATABASE_PATH = os.getenv("DATABASE_PATH", "./shopping.db")
SECRET_KEY = os.getenv("SECRET_KEY", "local-dev-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = read_int_env("ACCESS_TOKEN_EXPIRE_MINUTES", 15)
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", SECRET_KEY)
REFRESH_TOKEN_ALGORITHM = os.getenv("REFRESH_TOKEN_ALGORITHM", ALGORITHM)
REFRESH_TOKEN_EXPIRE_DAYS = read_int_env("REFRESH_TOKEN_EXPIRE_DAYS", 7)

DEFAULT_CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]


def parse_cors_origins() -> list[str]:
    raw_origins = os.getenv("CORS_ORIGINS")
    if not raw_origins:
        return DEFAULT_CORS_ORIGINS

    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    return origins or DEFAULT_CORS_ORIGINS


CORS_ORIGINS = parse_cors_origins()
CORS_ALLOW_CREDENTIALS = "*" not in CORS_ORIGINS
