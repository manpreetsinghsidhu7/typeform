import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./typeform.db")
auth_token = os.getenv("TURSO_AUTH_TOKEN")

connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite:///") and not SQLALCHEMY_DATABASE_URL.startswith("sqlite+libsql"):
    connect_args = {"check_same_thread": False}
elif SQLALCHEMY_DATABASE_URL.startswith("sqlite+libsql"):
    if not auth_token:
        raise ValueError("CRITICAL ERROR: TURSO_AUTH_TOKEN environment variable is missing or empty on Render!")
    connect_args = {"auth_token": auth_token}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
