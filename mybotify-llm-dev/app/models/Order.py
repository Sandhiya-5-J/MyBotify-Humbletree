import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    order_number = Column(String, nullable=True)
    customer_name = Column(String, nullable=True)
    customer_email = Column(String, nullable=True)
    total_price = Column(Float, nullable=True)
    currency = Column(String, nullable=True)
    financial_status = Column(String, nullable=True)  # paid, pending, refunded
    fulfillment_status = Column(String, nullable=True)  # fulfilled, unfulfilled, partial
    items_count = Column(Integer, nullable=True)
    order_date = Column(DateTime, nullable=True)
    created_at = Column(
        DateTime, default=datetime.datetime.now(tz=datetime.timezone.utc)
    )

    # Relationships
    store = relationship("Store", back_populates="orders")

    def __repr__(self):
        return f"<Order(id={self.id}, order_number='{self.order_number}')>"
