import sys
import asyncio
from contextlib import asynccontextmanager

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api import chat, store, tags_metadata, user, campaign, website
from app.core.database import pool
from app.core.rate_limiter import limiter
from app.core.scheduler import start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    await pool.open()
    start_scheduler()
    yield
    await pool.close()


def create_app() -> FastAPI:
    app = FastAPI(
        title="Mybotify", openapi_tags=tags_metadata, version="1.0.0", lifespan=lifespan
    )

    # Attach rate limiter to the app
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/", tags=["index"])
    async def index():
        return {"message": "Welcome to Mybotify API"}

    app.include_router(user, prefix="/api/user", tags=["user"])
    app.include_router(chat, prefix="/api/chat", tags=["chat"])
    app.include_router(store, prefix="/api/store", tags=["store"])
    app.include_router(campaign, prefix="/api/campaign", tags=["campaign"])
    app.include_router(website, prefix="/api/website", tags=["website"])

    return app
