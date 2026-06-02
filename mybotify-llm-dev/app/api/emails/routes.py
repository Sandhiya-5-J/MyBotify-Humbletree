from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_session
from app.core.middleware.auth import get_current_user
from app.api.emails.utils.schema import EmailGenerateRequest, EmailSequenceResponse, SendTestEmailRequest
from app.api.emails.service import generate_email_sequence, send_test_email
from app.models import User

router = APIRouter()

@router.post("/generate", response_model=EmailSequenceResponse)
async def generate_emails(
    request: EmailGenerateRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Generate an AI-powered email sequence."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    sequence = generate_email_sequence(request, user.id, db)
    return sequence

@router.post("/send-test")
async def send_test_email_endpoint(
    request: SendTestEmailRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """Send a test email template to a specified address."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    send_test_email(request, user.id, db)
    return {"message": "Test email successfully sent via SMTP"}

