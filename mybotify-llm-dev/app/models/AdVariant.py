import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, Float
from sqlalchemy.orm import relationship

from app.core.database import Base


class AdVariant(Base):
    __tablename__ = "ad_variants"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    name = Column(String, nullable=False)
    ad_copy = Column(Text, nullable=True)
    ad_creative_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    spent = Column(Float, default=0.0)
    revenue = Column(Float, default=0.0)
    clicks = Column(Integer, default=0)
    is_winner = Column(Boolean, default=False)

    created_at = Column(
        DateTime, default=datetime.datetime.now(tz=datetime.timezone.utc)
    )
    updated_at = Column(
        DateTime,
        default=datetime.datetime.now(tz=datetime.timezone.utc),
        onupdate=datetime.datetime.now(tz=datetime.timezone.utc),
    )

    def __repr__(self):
        return f"<AdVariant(id={self.id}, name='{self.name}', campaign_id={self.campaign_id})>"
