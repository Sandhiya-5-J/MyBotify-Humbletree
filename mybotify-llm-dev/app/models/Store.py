import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    store_name = Column(String, nullable=False)
    store_url = Column(String, nullable=True)  # e.g. mystore.myshopify.com
    description = Column(Text, nullable=True)
    shopify_domain = Column(String, nullable=True)  # primary domain
    shopify_email = Column(String, nullable=True)
    shopify_plan = Column(String, nullable=True)
    currency = Column(String, nullable=True)
    country = Column(String, nullable=True)
    access_token = Column(Text, nullable=True)  # Shopify Admin API token (optional for manual)
    is_active = Column(Boolean, default=True)
    connected_at = Column(
        DateTime, default=datetime.datetime.now(tz=datetime.timezone.utc)
    )
    updated_at = Column(
        DateTime,
        default=datetime.datetime.now(tz=datetime.timezone.utc),
        onupdate=datetime.datetime.now(tz=datetime.timezone.utc),
    )

    # Relationships
    products = relationship("Product", back_populates="store", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="store", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="store", cascade="all, delete-orphan")
    campaigns = relationship("Campaign", back_populates="store", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Store(id={self.id}, name='{self.store_name}', url='{self.store_url}')>"
