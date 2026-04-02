from datetime import datetime
from typing import Optional

from pydantic import BaseModel


# --- Store schemas ---

class StoreConnect(BaseModel):
    """For Shopify API token connection."""
    store_url: str
    access_token: str


class StoreManualCreate(BaseModel):
    """For manual store entry."""
    store_name: str
    store_url: Optional[str] = None
    description: Optional[str] = None
    shopify_email: Optional[str] = None
    currency: Optional[str] = None
    country: Optional[str] = None


class StoreResponse(BaseModel):
    id: int
    user_id: int
    store_name: str
    store_url: Optional[str]
    description: Optional[str]
    shopify_domain: Optional[str]
    shopify_email: Optional[str]
    shopify_plan: Optional[str]
    currency: Optional[str]
    country: Optional[str]
    is_active: bool
    connected_at: datetime
    updated_at: datetime
    products_count: Optional[int] = 0
    orders_count: Optional[int] = 0
    customers_count: Optional[int] = 0

    class Config:
        from_attributes = True


# --- Product schemas ---

class ProductResponse(BaseModel):
    id: int
    store_id: int
    title: str
    description: Optional[str]
    price: Optional[float]
    compare_at_price: Optional[float]
    sku: Optional[str]
    status: Optional[str]
    product_type: Optional[str]
    vendor: Optional[str]
    inventory_quantity: Optional[int]
    image_url: Optional[str]

    class Config:
        from_attributes = True


# --- Order schemas ---

class OrderResponse(BaseModel):
    id: int
    store_id: int
    order_number: Optional[str]
    customer_name: Optional[str]
    customer_email: Optional[str]
    total_price: Optional[float]
    currency: Optional[str]
    financial_status: Optional[str]
    fulfillment_status: Optional[str]
    items_count: Optional[int]
    order_date: Optional[datetime]

    class Config:
        from_attributes = True
