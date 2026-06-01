import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class AdAccount(Base):
    __tablename__ = "ad_accounts"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    platform = Column(String, nullable=False)  # 'Facebook', 'Google Ads'
    account_id = Column(String, nullable=False)  # act_xxxxxx or Google Ads Customer ID
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(
        DateTime, default=datetime.datetime.now(tz=datetime.timezone.utc)
    )
    updated_at = Column(
        DateTime,
        default=datetime.datetime.now(tz=datetime.timezone.utc),
        onupdate=datetime.datetime.now(tz=datetime.timezone.utc),
    )

    # Relationships
    store = relationship("Store", back_populates="ad_accounts")

    def __repr__(self):
        return f"<AdAccount(id={self.id}, platform='{self.platform}', account_id='{self.account_id}')>"
