from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)

    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    accepts_marketing = Column(Boolean, default=False)
    total_spent = Column(Float, nullable=True)
    total_orders = Column(Integer, nullable=True)
    city = Column(String, nullable=True)
    province = Column(String, nullable=True)
    country = Column(String, nullable=True)
    tags = Column(String, nullable=True)

    # Relationships
    store = relationship("Store", back_populates="customers")
