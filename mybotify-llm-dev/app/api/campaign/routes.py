from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.api.campaign.service import (
    create_campaign,
    delete_campaign,
    generate_campaign_content,
    get_campaigns_for_store,
    update_campaign,
    generate_budget_optimization,
    apply_budget_optimization,
    get_campaign_variants,
    create_campaign_variant,
    generate_ab_test_variants,
    set_variant_status,
    select_variant_winner,
)
from app.api.campaign.utils.schema import (
    CampaignCreate,
    CampaignGenerateRequest,
    CampaignResponse,
    CampaignUpdate,
    OptimizationResponse,
    ApplyOptimizationRequest,
    AdVariantResponse,
    AdVariantCreate,
    AdVariantStatusUpdate,
    AdVariantGenerateRequest,
)
from app.core.database import get_session
from app.core.middleware.auth import get_current_user
from app.models import User

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=CampaignResponse)
async def create_new_campaign(
    campaign: CampaignCreate,
    background_tasks: BackgroundTasks,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Create a new campaign for a store."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    return create_campaign(db, campaign, user.id, background_tasks)


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

@router.get("/store/{store_id}/optimize", response_model=OptimizationResponse)
async def optimize_campaigns(
    store_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Scan campaigns and generate budget shift recommendations."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return generate_budget_optimization(store_id, user.id, db)

@router.post("/optimize/apply")
async def apply_optimization(
    req: ApplyOptimizationRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Apply budget optimization shifts."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return apply_budget_optimization(req.shifts, user.id, db)


@router.get("/{campaign_id}/variants", response_model=List[AdVariantResponse])
async def list_campaign_variants(
    campaign_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Get all A/B testing variants for a campaign."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return get_campaign_variants(db, campaign_id, user.id)


@router.post("/{campaign_id}/variants", response_model=AdVariantResponse)
async def create_new_variant(
    campaign_id: int,
    variant_in: AdVariantCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Create a new A/B testing variant manually."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return create_campaign_variant(db, campaign_id, variant_in, user.id)


@router.post("/{campaign_id}/variants/generate", response_model=List[AdVariantResponse])
async def generate_variants_ai(
    campaign_id: int,
    req: AdVariantGenerateRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Use AI to generate A/B testing variants for copy and creative."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return generate_ab_test_variants(db, campaign_id, user.id, req.num_variants or 2)


@router.put("/{campaign_id}/variants/{variant_id}/status", response_model=AdVariantResponse)
async def update_variant_status_endpoint(
    campaign_id: int,
    variant_id: int,
    status_update: AdVariantStatusUpdate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Pause or activate an A/B testing variant."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return set_variant_status(db, campaign_id, variant_id, status_update.is_active, user.id)


@router.post("/{campaign_id}/variants/{variant_id}/set-winner", response_model=AdVariantResponse)
async def declare_variant_winner_endpoint(
    campaign_id: int,
    variant_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Declare an A/B testing variant as the campaign winner."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return select_variant_winner(db, campaign_id, variant_id, user.id)

