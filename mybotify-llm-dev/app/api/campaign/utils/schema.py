from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CampaignBase(BaseModel):
    name: str
    platform: str
    status: Optional[str] = "Active"
    budget: Optional[float] = 0.0
    target_audience: Optional[str] = None
    generated_copy: Optional[str] = None
    products_targeted: Optional[str] = None
    ad_creative_url: Optional[str] = None


class CampaignCreate(CampaignBase):
    store_id: int


class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    platform: Optional[str] = None
    status: Optional[str] = None
    budget: Optional[float] = None
    target_audience: Optional[str] = None
    generated_copy: Optional[str] = None
    products_targeted: Optional[str] = None
    ad_creative_url: Optional[str] = None


class CampaignResponse(CampaignBase):
    id: int
    store_id: int
    spent: float
    revenue: float
    clicks: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CampaignGenerateRequest(BaseModel):
    store_id: int
    platform: str
    goal: Optional[str] = "Increase sales"
    target_audience: Optional[str] = "Broad audience"
    products_context: Optional[str] = None
