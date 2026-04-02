"""Create the 'users' table matching the actual User model, without importing app modules."""
import datetime
import enum

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    Enum,
    Integer,
    MetaData,
    String,
    Table,
    create_engine,
)
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")


class UserRole(enum.Enum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"


settings = Settings()
engine = create_engine(settings.DATABASE_URL, echo=True)

metadata = MetaData()

users_table = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("name", String, index=True),
    Column("role", Enum(UserRole), default="USER"),
    Column("email", String, unique=True, index=True),
    Column("phone_number", BigInteger, unique=True, nullable=True),
    Column("is_active", Boolean, default=True),
    Column("hashed_password", String),
    Column("email_verification", String, nullable=True),
    Column("phone_number_verification", String, nullable=True),
    Column("reset_password_code", String, nullable=True),
    Column("created_at", DateTime, default=datetime.datetime.now(tz=datetime.timezone.utc)),
    Column("updated_at", DateTime, default=datetime.datetime.now(tz=datetime.timezone.utc)),
)

metadata.create_all(engine)
print("'users' table created successfully!")
