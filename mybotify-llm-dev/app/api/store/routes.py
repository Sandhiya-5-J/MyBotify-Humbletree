from typing import Annotated, List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.store.service import (
    add_store_manual,
    connect_store,
    disconnect_store,
    get_all_stores,
    get_store_analytics,
    get_store_orders,
    get_store_products,
    get_user_stores,
    parse_and_save_customers_csv,
    parse_and_save_orders_csv,
    parse_and_save_products_csv,
    get_store_prediction,
)
from app.api.store.utils.schema import (
    OrderResponse,
    ProductResponse,
    StoreConnect,
    StoreManualCreate,
    StoreResponse,
    AdAccountCreate,
    AdAccountResponse,
    PredictionResponse,
)
from app.core.database import get_session
from app.core.middleware.auth import get_current_user, require_admin
from app.models import Store, User, AdAccount

store = APIRouter()


# ==================== Shopify API Connection (existing) ====================


@store.post("/connect", status_code=status.HTTP_201_CREATED, response_model=StoreResponse)
async def connect_shopify_store(
    store_data: StoreConnect,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Connect a Shopify store via Admin API token."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    return connect_store(
        store_url=store_data.store_url,
        access_token=store_data.access_token,
        user_id=user.id,
        db=db,
    )


# ==================== Manual Store Entry (new) ====================


@store.post("/add-manual", status_code=status.HTTP_201_CREATED, response_model=StoreResponse)
async def add_manual_store(
    store_data: StoreManualCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Add a store manually without Shopify API."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    return add_store_manual(
        store_name=store_data.store_name,
        user_id=user.id,
        db=db,
        store_url=store_data.store_url,
        description=store_data.description,
        shopify_email=store_data.shopify_email,
        currency=store_data.currency,
        country=store_data.country,
    )


# ==================== CSV Uploads ====================


@store.post("/{store_id}/upload-products", status_code=status.HTTP_200_OK)
async def upload_products_csv(
    store_id: int,
    file: UploadFile = File(...),
    current_user: Annotated[dict, Depends(get_current_user)] = None,
    db: Session = Depends(get_session),
):
    """Upload a products CSV file for a store."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    db_store = db.query(Store).filter(Store.id == store_id, Store.user_id == user.id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")

    return await parse_and_save_products_csv(file, store_id, db)


@store.post("/{store_id}/upload-orders", status_code=status.HTTP_200_OK)
async def upload_orders_csv(
    store_id: int,
    file: UploadFile = File(...),
    current_user: Annotated[dict, Depends(get_current_user)] = None,
    db: Session = Depends(get_session),
):
    """Upload an orders CSV file for a store."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    db_store = db.query(Store).filter(Store.id == store_id, Store.user_id == user.id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")

    return await parse_and_save_orders_csv(file, store_id, db)


@store.post("/{store_id}/upload-customers")
async def upload_customers(
    store_id: int,
    file: UploadFile = File(...),
    current_user: Annotated[dict, Depends(get_current_user)] = None,
    db: Session = Depends(get_session),
):
    """Upload a customers CSV file for a store."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    db_store = db.query(Store).filter(Store.id == store_id, Store.user_id == user.id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")

    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only CSV files are supported")
    return await parse_and_save_customers_csv(file, store_id, db)


# ==================== List Data ====================


@store.get("/{store_id}/products", response_model=List[ProductResponse])
async def list_store_products(
    store_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Get all products for a store."""
    return get_store_products(store_id, db)


@store.get("/{store_id}/orders", response_model=List[OrderResponse])
async def list_store_orders(
    store_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Get all orders for a store."""
    return get_store_orders(store_id, db)


# ==================== Existing ====================


@store.get("/{store_id}/analytics")
async def store_analytics(
    store_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Get market + sales analytics for a store."""
    return get_store_analytics(store_id, db)


@store.get("/{store_id}/predict", response_model=PredictionResponse)
async def store_prediction(
    store_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Get AI-generated predictive insights for next week's revenue."""
    return get_store_prediction(store_id, db)


@store.get("/my-stores", response_model=List[StoreResponse])
async def get_my_stores(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Get current user's stores."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    return get_user_stores(user.id, db)


@store.get("/all", response_model=List[StoreResponse])
async def get_stores_list(
    admin: Annotated[dict, Depends(require_admin)],
    db: Session = Depends(get_session),
):
    """Get all stores (admin only)."""
    return get_all_stores(db)


@store.delete("/{store_id}", status_code=status.HTTP_200_OK)
async def remove_store(
    store_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Disconnect a store (cascades to products + orders)."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    is_admin = current_user.get("role") == "admin"
    return disconnect_store(store_id, user.id, db, is_admin=is_admin)


# ==================== Ad Account Connections ====================

@store.post("/{store_id}/ad-accounts", response_model=AdAccountResponse, status_code=status.HTTP_201_CREATED)
async def connect_ad_account(
    store_id: int,
    ad_account_data: AdAccountCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Connect a Meta or Google Ad account to a store."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    # Verify store ownership
    db_store = db.query(Store).filter(Store.id == store_id, Store.user_id == user.id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found or access denied")
        
    # Check if there is an existing ad account for this platform and store
    ad_acc = db.query(AdAccount).filter(
        AdAccount.store_id == store_id,
        AdAccount.platform == ad_account_data.platform
    ).first()
    
    if ad_acc:
        ad_acc.account_id = ad_account_data.account_id
        ad_acc.access_token = ad_account_data.access_token
        ad_acc.refresh_token = ad_account_data.refresh_token
        ad_acc.is_active = True
    else:
        ad_acc = AdAccount(
            store_id=store_id,
            platform=ad_account_data.platform,
            account_id=ad_account_data.account_id,
            access_token=ad_account_data.access_token,
            refresh_token=ad_account_data.refresh_token,
            is_active=True
        )
        db.add(ad_acc)
        
    db.commit()
    db.refresh(ad_acc)
    return ad_acc


@store.get("/{store_id}/ad-accounts", response_model=List[AdAccountResponse])
async def list_ad_accounts(
    store_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Get all connected ad accounts for a store."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    # Verify store ownership
    db_store = db.query(Store).filter(Store.id == store_id, Store.user_id == user.id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found or access denied")
        
    return db.query(AdAccount).filter(AdAccount.store_id == store_id).all()


@store.delete("/{store_id}/ad-accounts/{platform}", status_code=status.HTTP_200_OK)
async def disconnect_ad_account(
    store_id: int,
    platform: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Disconnect an ad account."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    db_store = db.query(Store).filter(Store.id == store_id, Store.user_id == user.id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found or access denied")
        
    ad_acc = db.query(AdAccount).filter(
        AdAccount.store_id == store_id,
        AdAccount.platform == platform
    ).first()
    
    if not ad_acc:
        raise HTTPException(status_code=404, detail="Ad account not found")
        
    db.delete(ad_acc)
    db.commit()
    return {"message": f"{platform} account disconnected successfully"}

