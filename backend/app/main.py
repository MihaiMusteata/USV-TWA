from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import (
    ADDITIONAL_API_PREFIXES,
    CORS_ALLOW_CREDENTIALS,
    CORS_ORIGIN_REGEX,
    CORS_ORIGINS,
    INITIALIZE_DATABASE_ON_STARTUP,
)
from app.database.schema import initialize_database
from app.routers import auth, health, products


@asynccontextmanager
async def lifespan(_: FastAPI):
    if INITIALIZE_DATABASE_ON_STARTUP:
        initialize_database()
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="Lista de cumparaturi API", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_origin_regex=CORS_ORIGIN_REGEX,
        allow_credentials=CORS_ALLOW_CREDENTIALS,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    include_routers(app)
    for prefix in ADDITIONAL_API_PREFIXES:
        include_routers(app, prefix=prefix, include_in_schema=False)

    return app


def include_routers(app: FastAPI, prefix: str = "", include_in_schema: bool = True) -> None:
    app.include_router(health.router, prefix=prefix, include_in_schema=include_in_schema)
    app.include_router(auth.router, prefix=prefix, include_in_schema=include_in_schema)
    app.include_router(products.router, prefix=prefix, include_in_schema=include_in_schema)


app = create_app()
