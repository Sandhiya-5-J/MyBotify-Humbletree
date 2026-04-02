from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, create_engine

from app.core.config import settings

from .pool import pool

connect_args = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, echo=True)
session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with session() as s:
        yield s


__all__ = ['Base', 'get_session', 'pool']
