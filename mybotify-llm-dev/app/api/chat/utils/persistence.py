import sys

from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from app.core.database import pool

# Skip initialization during Alembic operations
is_alembic = any("alembic" in arg for arg in sys.argv)

_checkpointer = None

async def get_checkpointer():
    global _checkpointer
    if is_alembic:
        return None
    if _checkpointer is None:
        _checkpointer = AsyncPostgresSaver(pool)
        await _checkpointer.setup()
    return _checkpointer
