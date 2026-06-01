import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, Float
from sqlalchemy.orm import relationship

from app.core.database import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    name = Column(String, nullable=False)
    platform = Column(String, nullable=False)  # Facebook, Instagram, Google Ads
    status = Column(String, default="Active")  # Active, Inactive, Paused
    budget = Column(Float, default=0.0)
    target_audience = Column(Text, nullable=True)
    generated_copy = Column(Text, nullable=True)
    products_targeted = Column(Text, nullable=True) # JSON list of selected product names
    ad_creative_url = Column(String, nullable=True)
    
    # Real Ad Platform Tracking Info
    external_campaign_id = Column(String, nullable=True)
    ad_account_id = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Tracking metrics (dummy default zero for now)
    spent = Column(Float, default=0.0)
    revenue = Column(Float, default=0.0)
    clicks = Column(Integer, default=0)

    created_at = Column(
        DateTime, default=datetime.datetime.now(tz=datetime.timezone.utc)
    )
    updated_at = Column(
        DateTime,
        default=datetime.datetime.now(tz=datetime.timezone.utc),
        onupdate=datetime.datetime.now(tz=datetime.timezone.utc),
    )

    # Relationships
    store = relationship("Store", back_populates="campaigns")

    def __repr__(self):
        return f"<Campaign(id={self.id}, name='{self.name}', platform='{self.platform}')>"
