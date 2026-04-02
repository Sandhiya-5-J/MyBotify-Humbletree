import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=True)
    compare_at_price = Column(Float, nullable=True)
    sku = Column(String, nullable=True)
    status = Column(String, nullable=True)  # active, draft, archived
    product_type = Column(String, nullable=True)
    vendor = Column(String, nullable=True)
    inventory_quantity = Column(Integer, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(
        DateTime, default=datetime.datetime.now(tz=datetime.timezone.utc)
    )

    # Relationships
    store = relationship("Store", back_populates="products")

    def __repr__(self):
        return f"<Product(id={self.id}, title='{self.title}')>"
