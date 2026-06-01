from fastapi import HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.models import Campaign, Store, AdAccount, AdVariant
from app.api.campaign.utils.schema import CampaignCreate, CampaignUpdate
from app.core.database import session
from app.services.ad_platforms import MockAdPlatformAdapter, MetaAdPlatformAdapter, GoogleAdPlatformAdapter

def deploy_campaign_task(campaign_data: dict, campaign_id: int):
    db = session()
    try:
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            print(f"[CampaignTask] Campaign {campaign_id} not found.")
            return

        # Determine platform type & load credentials
        platform = campaign.platform
        ad_account = None
        
        # Meta platforms
        target_platform = "Facebook" if platform in ["Facebook", "Instagram"] else "Google Ads"
        ad_account = db.query(AdAccount).filter(
            AdAccount.store_id == campaign.store_id,
            AdAccount.platform == target_platform,
            AdAccount.is_active == True
        ).first()

        # Instantiate appropriate adapter
        if ad_account:
            print(f"[CampaignTask] Found active {target_platform} credentials (Account: {ad_account.account_id})")
            if target_platform == "Facebook":
                adapter = MetaAdPlatformAdapter(
                    access_token=ad_account.access_token,
                    ad_account_id=ad_account.account_id
                )
            else:
                adapter = GoogleAdPlatformAdapter(
                    access_token=ad_account.access_token,
                    customer_id=ad_account.account_id
                )
        else:
            print(f"[CampaignTask] No active live credentials for {platform}. Using Mock adapter.")
            adapter = MockAdPlatformAdapter()

        # Execute deployment
        external_id = adapter.deploy_campaign(campaign_data)
        
        # Save external campaign ID and details to DB
        campaign.external_campaign_id = external_id
        campaign.ad_account_id = ad_account.account_id if ad_account else "mock"
        campaign.status = "Active"
        db.commit()
        print(f"[CampaignTask] Successfully deployed campaign {campaign_id}. Ext ID: {external_id}")

    except Exception as e:
        db.rollback()
        print(f"[CampaignTask] Failed to deploy campaign: {e}")
        try:
            # Mark campaign as Paused/Failed with error details
            campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
            if campaign:
                campaign.status = "Paused"
                campaign.error_message = str(e)
                db.commit()
        except Exception as db_err:
            print(f"[CampaignTask] Double fault updating campaign state: {db_err}")
    finally:
        db.close()

def create_campaign(db: Session, campaign: CampaignCreate, user_id: int, background_tasks: BackgroundTasks = None) -> Campaign:
    # Ensure store belongs to user
    store = db.query(Store).filter(Store.id == campaign.store_id, Store.user_id == user_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found or access denied")
    
    db_campaign = Campaign(**campaign.model_dump())
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    
    if background_tasks:
        background_tasks.add_task(deploy_campaign_task, campaign.model_dump(), db_campaign.id)
        
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
    Generate an engaging, high-converting ad copy for the following store:
    Store Name: {store.store_name}
    Platform: {platform}
    Goal: {goal}
    Target Audience: {target_audience}{products_section}
    
    Requirements:
    1. Start with a strong Hook.
    2. Provide a persuasive Body.
    3. End with a clear Call-to-Action (CTA).
    4. Use appropriate emojis for the platform.
    5. ONLY output the ad copy text. Do not include introductory remarks or labels like "Hook:", "Body:".
    """
    
    response = model.invoke([HumanMessage(content=prompt)])
    generated_copy = response.content.strip()

    image_prompt_str = f"""
    You are an expert AI image prompt engineer. 
    Write a short, descriptive prompt (max 200 characters) to generate an ad creative image for this store:
    Store Name: {store.store_name}
    Context: {products_context or goal}
    Target Audience: {target_audience}
    
    The prompt should describe a high-quality, professional photography shot.
    ONLY output the prompt text, nothing else.
    """
    img_response = model.invoke([HumanMessage(content=image_prompt_str)])
    generated_img_prompt = img_response.content.strip()

    # Clean the prompt
    if generated_img_prompt.startswith("```"):
        lines = generated_img_prompt.split("\n")
        if len(lines) > 2:
            generated_img_prompt = "\n".join(lines[1:-1])
    generated_img_prompt = generated_img_prompt.strip().replace("\n", " ").replace("\"", "").replace("'", "")

    import urllib.parse
    url_encoded_prompt = urllib.parse.quote(generated_img_prompt)
    ad_creative_url = f"https://image.pollinations.ai/prompt/{url_encoded_prompt}?width=1080&height=1080&nologo=true"

    return {
        "generated_copy": generated_copy,
        "ad_creative_url": ad_creative_url,
        "target_audience": target_audience,
        "platform": platform
    }

def generate_budget_optimization(store_id: int, user_id: int, db: Session) -> dict:
    from langchain.chat_models import init_chat_model
    from app.api.chat.utils.config import ChatSettings
    from langchain_core.messages import HumanMessage
    import json

    # 1. Verify store ownership
    store = db.query(Store).filter(Store.id == store_id, Store.user_id == user_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found or access denied")

    # 2. Fetch active campaigns
    campaigns = db.query(Campaign).filter(Campaign.store_id == store_id, Campaign.status == "Active").all()
    if len(campaigns) < 2:
        return {"recommendations": []}

    # 3. Format active campaigns data for the AI analyst
    campaigns_data = []
    for c in campaigns:
        roas = round(c.revenue / c.spent, 2) if c.spent and c.spent > 0 else 0.0
        campaigns_data.append({
            "campaign_id": c.id,
            "name": c.name,
            "platform": c.platform,
            "budget": c.budget or 0.0,
            "spent": c.spent or 0.0,
            "revenue": c.revenue or 0.0,
            "clicks": c.clicks or 0,
            "roas": roas
        })

    prompt_text = f"""
    You are an expert e-commerce ad strategist and media buyer.
    Analyze these active ad campaigns for the Shopify store "{store.store_name}":
    {campaigns_data}

    Your goal is to reallocate ad budgets to maximize total revenue.
    Identify underperforming campaigns (low ROAS, low clicks, high spent relative to revenue) and shift a portion of their daily budget to high-performing campaigns (high ROAS, strong conversion rate, high clicks).

    Provide recommendations strictly as a JSON object matching this schema:
    {{
        "recommendations": [
            {{
                "campaign_id_from": int, // ID of campaign to reduce budget from
                "campaign_name_from": string,
                "campaign_id_to": int, // ID of campaign to increase budget for
                "campaign_name_to": string,
                "amount_to_shift": float, // exact dollar amount to shift (keep it reasonable, e.g. 10 to 100 or up to 50% of the campaign_from budget)
                "expected_impact": string, // e.g. "+18.4% expected ROI boost"
                "reasoning": string // concise, professional media-buyer reasoning for the shift
            }}
        ]
    }}
    Do not include markdown codeblocks or any introductory/concluding text. Just return raw JSON.
    """

    CONFIG = ChatSettings()
    model = init_chat_model(
        f"{CONFIG.PROVIDER}:{CONFIG.MODEL}",
        api_key=CONFIG.API_KEY,
    )

    try:
        response = model.invoke([HumanMessage(content=prompt_text)])
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
        result = json.loads(content)
        return result
    except Exception as e:
        import sys
        print(f"[OptimizationService] AI optimization error: {e}", file=sys.stderr, flush=True)
        return {"recommendations": []}

def apply_budget_optimization(shifts: list, user_id: int, db: Session) -> dict:
    updated_campaign_ids = []
    
    for shift in shifts:
        # Support both Pydantic model attributes and dict access
        if hasattr(shift, 'campaign_id_from'):
            c_from_id = shift.campaign_id_from
            c_to_id = shift.campaign_id_to
            amount = shift.amount_to_shift
        else:
            c_from_id = shift.get("campaign_id_from")
            c_to_id = shift.get("campaign_id_to")
            amount = shift.get("amount_to_shift", 0.0)

        if not c_from_id or not c_to_id or amount <= 0:
            continue

        # Fetch and verify ownership for "From" campaign
        c_from = db.query(Campaign).join(Store).filter(Campaign.id == c_from_id, Store.user_id == user_id).first()
        # Fetch and verify ownership for "To" campaign
        c_to = db.query(Campaign).join(Store).filter(Campaign.id == c_to_id, Store.user_id == user_id).first()

        if not c_from or not c_to:
            raise HTTPException(status_code=404, detail="One or more campaigns not found or access denied")

        # Deduct budget safely (ensure we don't go below $5 minimum daily budget)
        current_from_budget = c_from.budget or 0.0
        new_from_budget = max(5.0, current_from_budget - amount)
        actual_shifted_amount = current_from_budget - new_from_budget

        if actual_shifted_amount <= 0:
            continue

        c_from.budget = new_from_budget
        c_to.budget = (c_to.budget or 0.0) + actual_shifted_amount

        updated_campaign_ids.extend([c_from.id, c_to.id])

    db.commit()
    return {"message": "AI budget optimization applied successfully", "updated_campaigns": list(set(updated_campaign_ids))}


def get_campaign_variants(db: Session, campaign_id: int, user_id: int):
    campaign = db.query(Campaign).join(Store).filter(Campaign.id == campaign_id, Store.user_id == user_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found or access denied")
    return db.query(AdVariant).filter(AdVariant.campaign_id == campaign_id).order_by(AdVariant.created_at.asc()).all()


def create_campaign_variant(db: Session, campaign_id: int, variant_in, user_id: int) -> AdVariant:
    campaign = db.query(Campaign).join(Store).filter(Campaign.id == campaign_id, Store.user_id == user_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found or access denied")
    
    v_data = variant_in.model_dump() if hasattr(variant_in, 'model_dump') else variant_in
    db_variant = AdVariant(campaign_id=campaign_id, **v_data)
    db.add(db_variant)
    db.commit()
    db.refresh(db_variant)
    return db_variant


def set_variant_status(db: Session, campaign_id: int, variant_id: int, is_active: bool, user_id: int) -> AdVariant:
    campaign = db.query(Campaign).join(Store).filter(Campaign.id == campaign_id, Store.user_id == user_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found or access denied")
    
    variant = db.query(AdVariant).filter(AdVariant.id == variant_id, AdVariant.campaign_id == campaign_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
        
    variant.is_active = is_active
    db.commit()
    db.refresh(variant)
    return variant


def select_variant_winner(db: Session, campaign_id: int, variant_id: int, user_id: int) -> AdVariant:
    campaign = db.query(Campaign).join(Store).filter(Campaign.id == campaign_id, Store.user_id == user_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found or access denied")
    
    variant = db.query(AdVariant).filter(AdVariant.id == variant_id, AdVariant.campaign_id == campaign_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
        
    variant.is_winner = True
    variant.is_active = True
    
    campaign.generated_copy = variant.ad_copy
    campaign.ad_creative_url = variant.ad_creative_url
    
    other_variants = db.query(AdVariant).filter(AdVariant.campaign_id == campaign_id, AdVariant.id != variant_id).all()
    for ov in other_variants:
        ov.is_active = False
        ov.is_winner = False
        
    db.commit()
    db.refresh(variant)
    db.refresh(campaign)
    return variant


def generate_ab_test_variants(db: Session, campaign_id: int, user_id: int, num_variants: int = 2) -> list:
    from langchain.chat_models import init_chat_model
    from app.api.chat.utils.config import ChatSettings
    from langchain_core.messages import HumanMessage
    import json
    import urllib.parse
    
    campaign = db.query(Campaign).join(Store).filter(Campaign.id == campaign_id, Store.user_id == user_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found or access denied")
        
    store = campaign.store
    
    prompt_text = f"""
    You are an expert digital marketing media buyer and copywriter.
    Create {num_variants} highly distinct, high-converting A/B testing variations for an ad campaign:
    Store Name: {store.store_name}
    Store Description: {store.description or ""}
    Platform: {campaign.platform}
    Current Target Audience: {campaign.target_audience or "Broad audience"}
    Products Targeted: {campaign.products_targeted or ""}
    
    Generate {num_variants} variations. Each variation should target a completely different psychological marketing hook (e.g. one could be high emotional/desire appeal, another could be value/discount/features appeal, another could be user-story/social-proof).
    
    Provide your output strictly as a JSON object with a list under the key "variants":
    {{
        "variants": [
            {{
                "name": "string", // Name of the variant describing its hook angle (e.g., "Emotional Story Hook" or "Direct Value Hook")
                "ad_copy": "string", // Complete ad copy with strong hooks, body copy, CTA and emojis.
                "image_prompt": "string" // A descriptive, professional, detailed prompt (max 200 chars) for an AI image generator to create the ad creative. DO NOT mention text on the image. Just describe the scene/object.
            }}
        ]
    }}
    Do not include markdown codeblocks or any introductory/concluding text. Just return raw JSON.
    """
    
    CONFIG = ChatSettings()
    model = init_chat_model(
        f"{CONFIG.PROVIDER}:{CONFIG.MODEL}",
        api_key=CONFIG.API_KEY,
    )
    
    try:
        response = model.invoke([HumanMessage(content=prompt_text)])
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
            
        result = json.loads(content.strip())
        variants_data = result.get("variants", [])
        
        created_variants = []
        for idx, item in enumerate(variants_data):
            img_prompt = item.get("image_prompt", "").strip().replace("\"", "").replace("'", "")
            url_encoded_prompt = urllib.parse.quote(img_prompt)
            creative_url = f"https://image.pollinations.ai/prompt/{url_encoded_prompt}?width=1080&height=1080&nologo=true"
            
            db_variant = AdVariant(
                campaign_id=campaign_id,
                name=item.get("name", f"AI Variant {idx+1}"),
                ad_copy=item.get("ad_copy", ""),
                ad_creative_url=creative_url,
                is_active=True,
                spent=0.0,
                revenue=0.0,
                clicks=0,
                is_winner=False
            )
            db.add(db_variant)
            created_variants.append(db_variant)
            
        db.commit()
        for v in created_variants:
            db.refresh(v)
            
        return created_variants
    except Exception as e:
        import sys
        print(f"[ABTestingService] AI A/B variant generation error: {e}", file=sys.stderr, flush=True)
        db_variant_1 = AdVariant(
            campaign_id=campaign_id,
            name="AI Variant A (Fallback)",
            ad_copy=campaign.generated_copy or "Check out our premium collection!",
            ad_creative_url=campaign.ad_creative_url,
            is_active=True
        )
        db_variant_2 = AdVariant(
            campaign_id=campaign_id,
            name="AI Variant B (Fallback)",
            ad_copy=f"Discover the best of {store.store_name} today! Free shipping on orders over $50.",
            ad_creative_url=campaign.ad_creative_url,
            is_active=True
        )
        db.add(db_variant_1)
        db.add(db_variant_2)
        db.commit()
        db.refresh(db_variant_1)
        db.refresh(db_variant_2)
        return [db_variant_1, db_variant_2]


