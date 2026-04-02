from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import Session

from app.api.user.schema import (
    ResendVerificationRequest,
    ResetPasswordConfirm,
    ResetPasswordRequest,
    Token,
    UserActiveUpdate,
    UserCreate,
    UserLogin,
    UserResponse,
    UserRoleUpdate,
    UserUpdate,
    VerifyUserRequest,
)
from app.api.user.service import (
    confirm_password_reset,
    login_user,
    register_user,
    request_password_reset,
    resend_verification,
    update_user,
    verify_user,
)
from app.core.database import get_session
from app.core.middleware.auth import get_current_user, require_admin
from app.models import User
from app.models.User import UserRole

user = APIRouter()


@user.post("/", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def create_user(user_data: UserCreate, db: Session = Depends(get_session)):
    return register_user(user_data, db)


@user.post("/verify", status_code=status.HTTP_200_OK, response_model=UserResponse)
async def user_verification(
    user_verification: VerifyUserRequest, db: Session = Depends(get_session)
):
    return verify_user(user_verification, db)


@user.post("/login", status_code=status.HTTP_200_OK)
async def user_login(
    user_data: UserLogin, response: Response, db: Session = Depends(get_session)
):
    """
    Login a user and set a secure HTTP-only cookie with the JWT token.
    """
    token_data = login_user(user_data, db)

    return Token(access_token=token_data["access_token"])


@user.post("/reset-password/request", status_code=status.HTTP_200_OK)
async def request_reset_password(
    reset_data: ResetPasswordRequest, db: Session = Depends(get_session)
):
    """
    Request a password reset by sending an OTP to the user's email.
    """
    return request_password_reset(reset_data, db)


@user.post("/reset-password/confirm", status_code=status.HTTP_200_OK)
async def confirm_reset_password(
    reset_data: ResetPasswordConfirm, db: Session = Depends(get_session)
):
    """
    Confirm password reset using the OTP and set new password.
    """
    return confirm_password_reset(reset_data, db)


@user.post("/resend-verification", status_code=status.HTTP_200_OK)
async def resend_verification_code(
    resend_data: ResendVerificationRequest, db: Session = Depends(get_session)
):
    """
    Resend verification code to user's email.
    """
    return resend_verification(resend_data, db)


@user.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_session),
):
    """
    Get current user information using JWT authentication.
    """
    db_user = db.query(User).filter(User.email == current_user["email"]).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return db_user


@user.patch("/me", status_code=status.HTTP_200_OK)
async def update_user_info(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """
    Patch endpoint to update user information (name, phone, password only)
    """

    db_user = db.query(User).filter(User.email == current_user["email"]).first()

    response = update_user(update_data=update_data, current_user=db_user, db=db)

    return response


# ===================== ADMIN-ONLY ENDPOINTS =====================


@user.get("/all", response_model=List[UserResponse])
async def get_all_users(
    admin: Annotated[dict, Depends(require_admin)],
    db: Session = Depends(get_session),
):
    """
    Get all users (admin only).
    """
    users = db.query(User).all()
    return users


@user.patch("/{user_id}/role", status_code=status.HTTP_200_OK)
async def change_user_role(
    user_id: int,
    role_data: UserRoleUpdate,
    admin: Annotated[dict, Depends(require_admin)],
    db: Session = Depends(get_session),
):
    """
    Change a user's role (admin only).
    """
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    try:
        new_role = UserRole(role_data.role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {[r.value for r in UserRole]}",
        )

    db_user.role = new_role
    db.commit()
    db.refresh(db_user)

    return {"message": f"User role updated to {new_role.value}", "user_id": user_id}


@user.patch("/{user_id}/active", status_code=status.HTTP_200_OK)
async def toggle_user_active(
    user_id: int,
    active_data: UserActiveUpdate,
    admin: Annotated[dict, Depends(require_admin)],
    db: Session = Depends(get_session),
):
    """
    Toggle user active/inactive status (admin only).
    """
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    db_user.is_active = active_data.is_active
    db.commit()
    db.refresh(db_user)

    status_text = "activated" if active_data.is_active else "deactivated"
    return {"message": f"User {status_text}", "user_id": user_id}
