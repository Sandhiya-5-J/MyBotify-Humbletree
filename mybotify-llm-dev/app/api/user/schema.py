from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, constr

from app.models.User import UserRole


# Pydantic models for request and response
class UserCreate(BaseModel):
    name: constr(min_length=1, max_length=100)
    email: EmailStr
    password: constr(min_length=8)
    phone_number: Optional[int] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    phone_number: Optional[int]
    email_verification: Optional[str]  # None means auto-verified (dev mode)
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VerifyUserRequest(BaseModel):
    email: EmailStr
    type: str
    code: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordConfirm(BaseModel):
    email: EmailStr
    code: str
    new_password: constr(min_length=8)


class ResendVerificationRequestType(str, Enum):
    EMAIL_VERIFICATION = "email_verification"
    PASSWORD_RESET = "password_reset"


class ResendVerificationRequest(BaseModel):
    email: EmailStr
    type: ResendVerificationRequestType


class Token(BaseModel):
    access_token: str


class UserUpdate(BaseModel):
    name: Optional[constr(min_length=1, max_length=100)] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[int] = None
    current_password: Optional[str] = None
    new_password: Optional[constr(min_length=8)] = None
    confirm_password: Optional[constr(min_length=8)] = None


class UserRoleUpdate(BaseModel):
    role: str  # "user", "admin", or "moderator"


class UserActiveUpdate(BaseModel):
    is_active: bool
