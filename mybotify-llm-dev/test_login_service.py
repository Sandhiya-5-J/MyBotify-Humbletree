import sys
from app.core.database import get_session
from app.api.user.schema import UserCreate, UserLogin
from app.api.user.service import register_user, login_user

db = next(get_session())

print("Testing register and login sequence...")
try:
    user_data = UserCreate(name="Test User Login", email="test_login_x1@example.com", password="password123")
    user = register_user(user_data, db)
    print(f"Registered user: {user.email}")
    
    login_data = UserLogin(email="test_login_x1@example.com", password="password123")
    token = login_user(login_data, db)
    print(f"Login success! Token length: {len(token['access_token'])}")
except Exception as e:
    print(f"Error: {e}")
