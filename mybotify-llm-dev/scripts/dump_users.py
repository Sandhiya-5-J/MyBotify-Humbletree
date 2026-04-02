import sys
from app.core.database import get_session
from app.models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = next(get_session())

users = db.query(User).order_by(User.id.desc()).limit(5).all()
with open('dump_users_out.txt', 'w', encoding='utf-8') as f:
    f.write("Last 5 registered users:\n")
    f.write("-" * 60 + "\n")

    for u in users:
        f.write(f"ID: {u.id} | Name: '{u.name}' | Email: '{u.email}'\n")
    
        for pwd in ['test12345', 'test12345 ', ' test12345', 'test12345\\n', 'password test12345', 'test12345,', 'password: test12345', 'test12345.']:
            try:
                if pwd_context.verify(pwd, u.hashed_password):
                    f.write(f"   => SUCCESS! Password is exactly: '{pwd}'\n")
                    break
            except Exception:
                pass
        f.write("-" * 60 + "\n")
