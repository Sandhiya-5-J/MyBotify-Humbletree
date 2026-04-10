from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.campaign.service import (
    create_campaign,
    delete_campaign,
    generate_campaign_content,
    get_campaigns_for_store,
    update_campaign,
)
from app.api.campaign.utils.schema import (
    CampaignCreate,
    CampaignGenerateRequest,
    CampaignResponse,
    CampaignUpdate,
)
from app.core.database import get_session
from app.core.middleware.auth import get_current_user
from app.models import User

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=CampaignResponse)
async def create_new_campaign(
    campaign: CampaignCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Create a new campaign for a store."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    return create_campaign(db, campaign, user.id)


@router.get("/store/{store_id}", response_model=List[CampaignResponse])
async def list_campaigns(
    store_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Get all campaigns for a specific store."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    return get_campaigns_for_store(db, store_id, user.id)


@router.put("/{campaign_id}", response_model=CampaignResponse)
async def modify_campaign(
    campaign_id: int,
    campaign_update: CampaignUpdate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Update a campaign."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    return update_campaign(db, campaign_id, campaign_update, user.id)


@router.delete("/{campaign_id}")
async def remove_campaign(
    campaign_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Delete a campaign."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    return delete_campaign(db, campaign_id, user.id)


@router.post("/generate")
async def generate_campaign(
    req: CampaignGenerateRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Use AI to generate campaign ad copy."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    return generate_campaign_content(db, req.store_id, req.platform, req.goal, req.target_audience, user.id, req.products_context)
