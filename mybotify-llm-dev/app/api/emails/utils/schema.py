from typing import List, Optional
from pydantic import BaseModel

class EmailGenerateRequest(BaseModel):
    store_id: int
    sequence_type: str  # e.g., "Abandoned Cart", "Welcome Series", "Promotional"
    tone: str           # e.g., "Professional", "Urgent", "Friendly"
    product_context: Optional[str] = None # Information about the promoted product
    audience: Optional[str] = None

class EmailTemplate(BaseModel):
    subject: str
    body: str
    call_to_action: str
    delay_days: int # How many days after previous email to send

class EmailSequenceResponse(BaseModel):
    emails: List[EmailTemplate]
