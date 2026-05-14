import os
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse


def read_int_env(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None:
        return default

    try:
        return int(value)
    except ValueError:
        return default


def normalize_database_url(database_url: str | None) -> str | None:
    if not database_url:
        return None

    database_url = database_url.strip().strip("\"'")
    for env_name in ("DATABASE_URL", "POSTGRES_URL", "POSTGRES_PRISMA_URL"):
        prefix = f"{env_name}="
        if database_url.startswith(prefix):
            database_url = database_url.removeprefix(prefix).strip().strip("\"'")
            break

    parsed = urlparse(database_url)
    hostname = parsed.hostname or ""
    if "supabase.co" not in hostname and "pooler.supabase.com" not in hostname:
        return database_url

    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    if not query.get("sslmode"):
        query["sslmode"] = "require"
    return urlunparse(parsed._replace(query=urlencode(query)))


IS_VERCEL = os.getenv("VERCEL") == "1"
DATABASE_URL = normalize_database_url(
    os.getenv("DATABASE_URL")
    or os.getenv("POSTGRES_URL")
    or os.getenv("POSTGRES_PRISMA_URL")
)
DATABASE_PATH = os.getenv("DATABASE_PATH", "/tmp/shopping.db" if IS_VERCEL else "./shopping.db")
DB_POOL_MAX_SIZE = read_int_env("DB_POOL_MAX_SIZE", 5)
DB_CONNECT_RETRIES = read_int_env("DB_CONNECT_RETRIES", 5)
DB_CONNECT_RETRY_DELAY_SECONDS = read_int_env("DB_CONNECT_RETRY_DELAY_SECONDS", 1)
INITIALIZE_DATABASE_ON_STARTUP = (
    os.getenv("INITIALIZE_DATABASE_ON_STARTUP", "0" if IS_VERCEL else "1") == "1"
)
SECRET_KEY = os.getenv("SECRET_KEY", "local-dev-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = read_int_env("ACCESS_TOKEN_EXPIRE_MINUTES", 15)
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", SECRET_KEY)
REFRESH_TOKEN_ALGORITHM = os.getenv("REFRESH_TOKEN_ALGORITHM", ALGORITHM)
REFRESH_TOKEN_EXPIRE_DAYS = read_int_env("REFRESH_TOKEN_EXPIRE_DAYS", 7)

DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


def parse_csv_env(name: str, default: list[str]) -> list[str]:
    raw_origins = os.getenv(name)
    if not raw_origins:
        return default

    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    return origins or default


def has_postgres_database() -> bool:
    return bool(DATABASE_URL)


CORS_ORIGINS = parse_csv_env("CORS_ORIGINS", DEFAULT_CORS_ORIGINS)
CORS_ORIGIN_REGEX = os.getenv("CORS_ORIGIN_REGEX")
CORS_ALLOW_CREDENTIALS = "*" not in CORS_ORIGINS
ADDITIONAL_API_PREFIXES = parse_csv_env("ADDITIONAL_API_PREFIXES", ["/api", "/api/index.py"])
