from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.website.service import (
    create_website,
    delete_website,
    get_websites_for_user,
    update_website,
)
from app.api.website.utils.schema import (
    WebsiteCreate,
    WebsiteResponse,
    WebsiteUpdate,
)
from app.core.database import get_session
from app.core.middleware.auth import get_current_user
from app.models import User

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=WebsiteResponse)
async def create_new_website(
    website: WebsiteCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Create a new website for the current user."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    return create_website(db, website, user.id)


@router.get("/my-websites", response_model=List[WebsiteResponse])
async def list_my_websites(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Get all websites for the current user."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    return get_websites_for_user(db, user.id)


@router.put("/{website_id}", response_model=WebsiteResponse)
async def modify_website(
    website_id: int,
    website_update: WebsiteUpdate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Update a website."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    return update_website(db, website_id, website_update, user.id)


@router.delete("/{website_id}")
async def remove_website(
    website_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Delete a website."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    return delete_website(db, website_id, user.id)
