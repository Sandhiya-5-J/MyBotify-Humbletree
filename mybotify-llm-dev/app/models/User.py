import datetime
import enum
import secrets

from sqlalchemy import BigInteger, Boolean, Column, DateTime, Enum, Integer, String

from app.core.database import Base


def generate_random_verification_code():
    return secrets.token_hex(16)


class UserRole(enum.Enum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(Enum(UserRole), default=UserRole.USER)
    email = Column(String, unique=True, index=True)
    phone_number = Column(BigInteger, unique=True, nullable=True)
    is_active = Column(Boolean, default=True)
    hashed_password = Column(String)
    email_verification = Column(String, nullable=True)
    phone_number_verification = Column(String, nullable=True)
    reset_password_code = Column(String, nullable=True)
    created_at = Column(
        DateTime, default=datetime.datetime.now(tz=datetime.timezone.utc)
    )
    updated_at = Column(
        DateTime,
        default=datetime.datetime.now(tz=datetime.timezone.utc),
        onupdate=datetime.datetime.now(tz=datetime.timezone.utc),
    )

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}')>"
