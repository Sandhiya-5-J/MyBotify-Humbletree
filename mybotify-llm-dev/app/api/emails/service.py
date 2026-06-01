import json
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models import Store
from app.api.emails.utils.schema import EmailGenerateRequest, EmailSequenceResponse

def generate_email_sequence(request: EmailGenerateRequest, user_id: int, db: Session) -> dict:
    # Ensure store belongs to user
    store = db.query(Store).filter(Store.id == request.store_id, Store.user_id == user_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found or access denied")
        
    from langchain.chat_models import init_chat_model
    from langchain_core.messages import HumanMessage
    from app.api.chat.utils.config import ChatSettings
    
    product_details = f"\nTarget Product / Promotion: {request.product_context}" if request.product_context else ""
    audience_details = f"\nTarget Audience: {request.audience}" if request.audience else ""

    prompt_text = f"""
    You are an expert e-commerce email marketing copywriter.
    Generate a 3-part '{request.sequence_type}' email sequence for the following store:
    Store Name: {store.store_name}
    Tone: {request.tone}{product_details}{audience_details}
    
    The sequence should consist of exactly 3 emails.
    Return your response strictly as a JSON object matching this schema:
    {{
        "emails": [
            {{
                "subject": "Email Subject Line",
                "body": "The main HTML or plain text body of the email. Keep it engaging. You can use standard <br/> or paragraphs.",
                "call_to_action": "Buy Now / Claim Discount",
                "delay_days": 0 // 0 for immediate, 1 for 1 day later, etc.
            }},
            ...
        ]
    }}
    Do not include markdown blocks or any other text outside the JSON.
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
        
        sequence_data = json.loads(content)
        return sequence_data
    except Exception as e:
        import sys
        print(f"Email Generation Error: {e}", file=sys.stderr, flush=True)
        raise HTTPException(status_code=500, detail="Failed to generate email sequence")
