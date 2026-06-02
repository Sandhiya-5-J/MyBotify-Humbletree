import json
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models import Store
from app.api.emails.utils.schema import EmailGenerateRequest, EmailSequenceResponse, SendTestEmailRequest

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

def send_test_email(request: SendTestEmailRequest, user_id: int, db: Session) -> bool:
    from app.core.email.sendmail import send_email
    
    formatted_body = request.body.replace("\n", "<br/>")
    current_year = datetime.now().year
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{request.subject}</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {{
            font-family: 'Plus Jakarta Sans', Arial, sans-serif;
            line-height: 1.6;
            background-color: #F1F5F2;
            margin: 0;
            padding: 40px 20px;
            color: #2c3e50;
        }}

        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            border: 1px solid rgba(46, 62, 72, 0.08);
        }}

        .email-header {{
            background-color: #2e3e48;
            color: #ffffff;
            text-align: center;
            padding: 30px 20px;
            border-bottom: 4px solid #CAF389;
        }}

        .email-header h2 {{
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
            color: #ffffff;
        }}
        
        .email-header span {{
            color: #CAF389;
        }}

        .email-content {{
            padding: 40px 35px;
            background-color: #ffffff;
        }}
        
        .email-body {{
            font-size: 16px;
            color: #334155;
            line-height: 1.8;
            margin-bottom: 30px;
        }}

        .cta-container {{
            text-align: center;
            margin: 35px 0;
        }}

        .btn {{
            display: inline-block;
            background-color: #2e3e48;
            color: #CAF389 !important;
            text-align: center;
            font-weight: 700;
            font-size: 15px;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 24px;
            box-shadow: 0 4px 12px rgba(46, 62, 72, 0.15);
            transition: all 0.2s ease;
            border: 2px solid #CAF389;
        }}

        .footer-note {{
            font-size: 12px;
            color: #64748b;
            text-align: center;
            padding: 25px 20px;
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
        }}
        
        .footer-note a {{
            color: #2e3e48;
            text-decoration: underline;
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h2>My<span>Botify</span> AI Marketing</h2>
        </div>

        <div class="email-content">
            <div class="email-body">
                {formatted_body}
            </div>

            <div class="cta-container">
                <a href="#" class="btn">{request.call_to_action}</a>
            </div>
        </div>

        <div class="footer-note">
            This is a preview/test of your automated email campaign generated via MyBotify.
            <br>
            © {current_year} MyBotify. All rights reserved.
            <br>
            If you wish to stop receiving these, you can <a href="#">unsubscribe here</a>.
        </div>
    </div>
</body>
</html>"""

    success = send_email(request.subject, html_content, request.to_email)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to dispatch test email via SMTP")
    return True

