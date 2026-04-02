import sys
from app.core.database import get_session
from app.models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = next(get_session())
email = "test@example.com"
user = db.query(User).filter(User.email == email).first()

if user:
    print(f"User found: ID: {user.id}, Name: '{user.name}', Email: '{user.email}'")
    
    # Try testing the exact password from the screenshot
    test_pwd = "test12345"
    is_valid = pwd_context.verify(test_pwd, user.hashed_password)
    print(f"Password '{test_pwd}' matches hash? {is_valid}")
    
    # What if it had a trailing space?
    test_pwd_space = "test12345 "
    is_valid_space = pwd_context.verify(test_pwd_space, user.hashed_password)
    print(f"Password '{test_pwd_space}' matches hash? {is_valid_space}")
    
    # What if it includes the comma from the prompt?
    test_pwd_comma = "test12345,"
    is_valid_comma = pwd_context.verify(test_pwd_comma, user.hashed_password)
    print(f"Password '{test_pwd_comma}' matches hash? {is_valid_comma}")
else:
    print(f"User {email} not found in DB!")
