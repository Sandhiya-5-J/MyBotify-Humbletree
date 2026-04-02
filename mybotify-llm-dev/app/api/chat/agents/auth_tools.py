"""
Authentication tools for AI agents.

Provides signup and login tools that call the existing user service layer
so the AI chatbot can register and authenticate users via conversation.
"""

import logging

from langchain_core.tools import tool

from app.api.user.schema import UserCreate, UserLogin
from app.api.user.service import register_user, login_user
from app.core.database import get_session

logger = logging.getLogger(__name__)


@tool
def signup_user_tool(name: str, email: str, password: str) -> str:
    """
    Sign up a new user with the given name, email, and password.
    Use this tool when a user wants to create a new account / register / sign up.
    The password must be at least 8 characters long.

    Args:
        name: The full name of the user
        email: The email address for the account
        password: The password (minimum 8 characters)

    Returns:
        A message indicating whether the signup was successful or failed.
    """
    name = name.strip() if name else ""
    email = email.strip() if email else ""
    password = password.strip() if password else ""
    
    if not name or not email or not password:
        return "❌ Signup failed: Missing required fields. Please ask the user to provide their full name, email address, and a password."
        
    try:
        db = next(get_session())
        user_data = UserCreate(name=name, email=email, password=password)
        user = register_user(user_data, db)
        return f"✅ Account created successfully! Name: {user.name}, Email: {user.email}. The user can now log in with their credentials."
    except Exception as e:
        error_msg = str(e.detail) if hasattr(e, 'detail') else str(e)
        logger.error(f"Signup tool error: {error_msg}")
        return f"❌ Signup failed: {error_msg}"


@tool
def login_user_tool(email: str, password: str) -> str:
    """
    Log in a user with the given email and password.
    Use this tool when a user wants to log in / sign in / authenticate.

    Args:
        email: The email address of the account
        password: The password for the account

    Returns:
        A message with the access token if login was successful, or an error message.
    """
    email = email.strip() if email else ""
    password = password.strip() if password else ""
    
    print(f"DEBUG: Login tool called with email='{email}' and password='{password}'")
    
    if not email or not password:
        return "❌ Login failed: Missing required fields. Please ask the user to provide their email address and password."
        
    try:
        db = next(get_session())
        user_data = UserLogin(email=email, password=password)
        token_data = login_user(user_data, db)
        access_token = token_data["access_token"]
        return f"✅ Login successful! Access token: {access_token}"
    except Exception as e:
        error_msg = str(e.detail) if hasattr(e, 'detail') else str(e)
        logger.error(f"Login tool error: {error_msg}")
        return f"❌ Login failed: {error_msg}"
