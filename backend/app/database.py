from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Connecting to DB. Default to SQLite if Postgres credentials not in environment to ensure zero-friction testing.
# For production, set DATABASE_URL=postgresql://user:password@localhost/ane_ai
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aneAI.db")

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
