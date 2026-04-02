from psycopg_pool import AsyncConnectionPool

from app.core.config import settings

kwargs = {
    'autocommit': True,
}

pool = AsyncConnectionPool(conninfo=settings.DATABASE_URL, open=False, kwargs=kwargs)
