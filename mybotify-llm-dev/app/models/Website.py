import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Website(Base):
    __tablename__ = "websites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    url = Column(String, nullable=False)
    name = Column(String, nullable=True)
    status = Column(String, default="Active")  # Active, Inactive
    is_active = Column(Boolean, default=True)
    created_at = Column(
        DateTime, default=datetime.datetime.now(tz=datetime.timezone.utc)
    )
    updated_at = Column(
        DateTime,
        default=datetime.datetime.now(tz=datetime.timezone.utc),
        onupdate=datetime.datetime.now(tz=datetime.timezone.utc),
    )

    def __repr__(self):
        return f"<Website(id={self.id}, url='{self.url}', status='{self.status}')>"
