from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.Website import Website
from app.api.website.utils.schema import WebsiteCreate, WebsiteUpdate


def create_website(db: Session, website: WebsiteCreate, user_id: int) -> Website:
    db_website = Website(
        user_id=user_id,
        url=website.url,
        name=website.name or website.url,
        status=website.status or "Active",
        is_active=True,
    )
    db.add(db_website)
    db.commit()
    db.refresh(db_website)
    return db_website


def get_websites_for_user(db: Session, user_id: int):
    return db.query(Website).filter(Website.user_id == user_id).all()


def update_website(db: Session, website_id: int, website_update: WebsiteUpdate, user_id: int):
    website = db.query(Website).filter(Website.id == website_id, Website.user_id == user_id).first()
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")

    update_data = website_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(website, key, value)

    db.commit()
    db.refresh(website)
    return website


def delete_website(db: Session, website_id: int, user_id: int):
    website = db.query(Website).filter(Website.id == website_id, Website.user_id == user_id).first()
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")

    db.delete(website)
    db.commit()
    return {"message": "Website deleted successfully"}
