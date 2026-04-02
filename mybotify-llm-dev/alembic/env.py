import os
import sys

# Add the project root directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context
from app.core.config import Settings
from app.core.database import Base
from app.models import User

#  uncomment it before migration

# Add the names of tables created by AsyncPostgresSaver

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

settings = Settings()
url = settings.DATABASE_URL
section = config.config_ini_section
config.set_section_option(section, "SQLALCHEMY_DATABASE_URL", url)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def include_object(obj, name, type_, reflected, compare_to):
    """
    Determine which database objects should be included in the autogeneration process.

    Args:
        obj: The database object being inspected
        name: The name of the object
        type_: The type of object (table, column, etc.)
        reflected: Whether the object was reflected from the database
        compare_to: The metadata being compared against, or None

    Returns:
        bool: True if the object should be included, False otherwise
    """
    # List of tables that were created outside of Alembic that we want to preserve
    existing_tables = [
        "checkpoint_blobs",
        "checkpoint_migrations",
        "checkpoint_writes",
        "checkpoints",
        "extShopDetails",
        "Session",
        "shopifyProducts",
    ]

    # If this is a table and it's in our list of existing tables,
    # exclude it from autogeneration
    if type_ == "table" and name in existing_tables:
        return False

    # Include all other objects
    return True


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=include_object,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_object=include_object,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
