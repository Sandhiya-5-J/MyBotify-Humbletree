from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class WebsiteBase(BaseModel):
    url: str
    name: Optional[str] = None
    status: Optional[str] = "Active"


class WebsiteCreate(WebsiteBase):
    pass


class WebsiteUpdate(BaseModel):
    url: Optional[str] = None
    name: Optional[str] = None
    status: Optional[str] = None


class WebsiteResponse(WebsiteBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
