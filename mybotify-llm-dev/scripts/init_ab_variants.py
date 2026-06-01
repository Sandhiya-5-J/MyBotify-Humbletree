import sys
import os

# Add the parent directory to Python path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")

settings = Settings()
engine = create_engine(settings.DATABASE_URL, echo=True)

# Import models to register on Base
from app.core.database import Base
from app.models.AdVariant import AdVariant

print("Creating database tables...")
Base.metadata.create_all(engine)
print("Database tables created successfully!")
