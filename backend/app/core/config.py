import os


DATABASE_PATH = os.getenv("DATABASE_PATH", "./shopping.db")
SECRET_KEY = os.getenv("SECRET_KEY", "local-dev-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]
