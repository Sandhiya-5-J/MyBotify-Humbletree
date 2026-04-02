from datetime import timedelta

from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy import update
from sqlalchemy.orm import Session

from app.api.user.schema import (
    ResendVerificationRequest,
    ResendVerificationRequestType,
    ResetPasswordConfirm,
    ResetPasswordRequest,
    UserCreate,
    UserLogin,
    UserUpdate,
    VerifyUserRequest,
)
from app.api.user.utils import get_otp, get_text_hash
from app.core.config import settings
from app.core.email.sendmail import EmailType, generate_email_body, send_email
from app.models import User, UserRole
from app.utils.jwt import (
    create_access_token,
    create_email_verification_token,
    verify_token,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def register_user(user_data: UserCreate, db: Session) -> User:
    # Check if user with email already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Check if phone number is already registered (if provided)
    if (
        user_data.phone_number
        and db.query(User).filter(User.phone_number == user_data.phone_number).first()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered",
        )

    # Create new user
    hashed_password = pwd_context.hash(user_data.password)

    # In development mode, auto-verify users (skip email verification)
    is_dev = settings.PYTHON_ENV == "development"

    if is_dev:
        email_otp = None
        email_otp_hash = None
    else:
        email_otp = get_otp()
        email_otp_hash = create_email_verification_token({"otp": email_otp})

    db_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,
        phone_number=user_data.phone_number,
        role=UserRole.USER,
        email_verification=email_otp_hash,
    )

    # In dev mode, explicitly override the column default to None
    if is_dev:
        db_user.email_verification = None
        db_user.phone_number_verification = None

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Send email verification (skip in dev mode)
    if not is_dev and email_otp:
        email_subject, email_body = generate_email_body(
            user_data.name, email_otp, email_type=EmailType.ACCOUNT_CREATION
        )
        send_email(subject=email_subject, body=email_body, to_address=user_data.email)

    return db_user


def verify_user(user_verification: VerifyUserRequest, db: Session) -> User:
    db_user = db.query(User).filter(User.email == user_verification.email).first()

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if user_verification.type == "email":
        if db_user.email_verification is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already verified",
            )
        extracted_otp = verify_token(db_user.email_verification)
        
        if not extracted_otp or user_verification.code == extracted_otp["otp"]:
            db_user.email_verification = None
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email verification code",
            )

    elif user_verification.type == "phone":
        if db_user.phone_number_verification is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number is already verified",
            )
        extracted_otp = verify_token(db_user.phone_number_verification)
        
        if not extracted_otp or user_verification.code == extracted_otp["otp"]:
            db_user.phone_number_verification = None
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid phone verification code",
            )

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification type"
        )

    db.commit()
    db.refresh(db_user)

    return db_user


def login_user(user_data: UserLogin, db: Session) -> dict:
    """
    Authenticate a user and return a JWT token.

    Args:
        user_data: The user login credentials
        db: The database session

    Returns:
        dict: The access token and token type

    Raises:
        HTTPException: If the credentials are invalid
    """
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not pwd_context.verify(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.email_verification is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email first",
        )

    access_token = create_access_token({"email": user.email, "role": user.role.value})

    return {"access_token": access_token, "token_type": "bearer"}


def request_password_reset(reset_data: ResetPasswordRequest, db: Session) -> dict:
    """
    Request a password reset by sending an OTP to the user's email.
    """
    user = db.query(User).filter(User.email == reset_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Generate OTP and store it
    otp = get_otp()
    user.reset_password_code = create_email_verification_token({"otp": otp})
    db.commit()

    # Send reset email
    email_subject, email_body = generate_email_body(
        name=user.name, otp=otp, email_type=EmailType.RESET_PASSWORD
    )
    send_email(body=email_body, subject=email_subject, to_address=user.email)

    return {"message": "Password reset code sent to your email"}


def confirm_password_reset(reset_data: ResetPasswordConfirm, db: Session) -> dict:
    """
    Confirm password reset using the OTP and set new password.
    """
    user = db.query(User).filter(User.email == reset_data.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if user.reset_password_code is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No password reset requested",
        )
        
    extracted_otp = verify_token(user.reset_password_code)

    if not extracted_otp or extracted_otp["otp"] != reset_data.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code",
        )

    # Update password
    user.hashed_password = pwd_context.hash(reset_data.new_password)
    user.reset_password_code = None
    db.commit()

    return {"message": "Password successfully reset"}


def resend_verification(resend_data: ResendVerificationRequest, db: Session) -> dict:
    """
    Resend verification code to user's email.
    """
    user = db.query(User).filter(User.email == resend_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if resend_data.type == ResendVerificationRequestType.EMAIL_VERIFICATION:
        if user.email_verification is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already verified",
            )
        else:
            # Generate new email verification code
            otp = get_otp()
            user.email_verification = create_email_verification_token({"otp": otp})

    elif resend_data.type == ResendVerificationRequestType.PASSWORD_RESET:
        if user.reset_password_code is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset code already sent",
            )
        else:
            # Generate new password reset code
            otp = get_otp()
            user.reset_password_code = create_email_verification_token({"otp": otp})

    db.commit()

    # Send verification email
    email_subject, email_body = generate_email_body(
        name=user.name, otp=otp, email_type=EmailType.RESEND_VERIFICATION
    )
    send_email(body=email_body, subject=email_subject, to_address=user.email)

    return {"message": "Verification code resent to your email"}


def update_user(update_data: UserUpdate, db: Session, current_user) -> dict:
    # Check if there's anything to update
    if all(value is None for value in update_data.dict().values()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided"
        )

    # Prepare update values dictionary
    update_values = {}
    updated_fields = []

    # Handle name update
    if update_data.name is not None:
        update_values["name"] = update_data.name
        updated_fields.append("name")

    # Handle phone number update
    if update_data.phone_number is not None:
        # Check if phone number is already used by another user
        existing_user = (
            db.query(User)
            .filter(
                User.phone_number == update_data.phone_number,
                User.id != current_user.id,
            )
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered with another account",
            )

        update_values["phone_number"] = update_data.phone_number
        updated_fields.append("phone_number")

    # Handle password update
    if update_data.new_password is not None:

        if update_data.new_password != update_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Input Password is Not matching !",
            )
        # Verify current password
        if not pwd_context.verify(
            update_data.current_password, current_user.hashed_password
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )

        # Update password
        update_values["hashed_password"] = pwd_context.hash(update_data.new_password)
        updated_fields.append("password")

    # Execute single database update operation
    if update_values:
        stmt = update(User).where(User.id == current_user.id).values(**update_values)
        db.execute(stmt)
        db.commit()

    return {
        "status": "success",
        "message": "User information updated successfully",
        "updated_fields": updated_fields,
    }
