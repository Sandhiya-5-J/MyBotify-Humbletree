from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models import Campaign, Store
from app.api.campaign.utils.schema import CampaignCreate, CampaignUpdate

def create_campaign(db: Session, campaign: CampaignCreate, user_id: int) -> Campaign:
    # Ensure store belongs to user
    store = db.query(Store).filter(Store.id == campaign.store_id, Store.user_id == user_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found or access denied")
    
    db_campaign = Campaign(**campaign.model_dump())
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

def get_campaigns_for_store(db: Session, store_id: int, user_id: int):
    # Ensure store belongs to user
    store = db.query(Store).filter(Store.id == store_id, Store.user_id == user_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found or access denied")
        
    return db.query(Campaign).filter(Campaign.store_id == store_id).all()

def update_campaign(db: Session, campaign_id: int, campaign_update: CampaignUpdate, user_id: int):
    campaign = db.query(Campaign).join(Store).filter(Campaign.id == campaign_id, Store.user_id == user_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    update_data = campaign_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(campaign, key, value)
        
    db.commit()
    db.refresh(campaign)
    return campaign

def delete_campaign(db: Session, campaign_id: int, user_id: int):
    campaign = db.query(Campaign).join(Store).filter(Campaign.id == campaign_id, Store.user_id == user_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    db.delete(campaign)
    db.commit()
    return {"message": "Campaign deleted successfully"}
    
def generate_campaign_content(db: Session, store_id: int, platform: str, goal: str, target_audience: str, user_id: int, products_context: str = None):
    # Ensure store belongs to user
    store = db.query(Store).filter(Store.id == store_id, Store.user_id == user_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found or access denied")
        
    # We will invoke the content agent to generate copy. Let's make it direct since we want to return it directly in the API
    from langchain.chat_models import init_chat_model
    from app.api.chat.utils.config import ChatSettings
    from langchain_core.messages import SystemMessage, HumanMessage
    
    CONFIG = ChatSettings()
    model = init_chat_model(
        f"{CONFIG.PROVIDER}:{CONFIG.MODEL}",
        api_key=CONFIG.API_KEY,
    )
    
    products_section = f"\n    Relevant Products ( weave these details into the ad copy): {products_context}" if products_context else ""
    
    prompt = f"""
    You are an expert digital marketing copywriter. 
    You need to generate an ad copy for the following store:
    Store Name: {store.store_name}
    Platform: {platform}
    Goal: {goal}
    Target Audience: {target_audience}{products_section}
    
    Please provide ONLY the ad copy text, optimized for the selected platform. Do not include any introductory remarks.
    """
    
    response = model.invoke([HumanMessage(content=prompt)])
    
    return {
        "generated_copy": response.content.strip(),
        "target_audience": target_audience,
        "platform": platform
    }
