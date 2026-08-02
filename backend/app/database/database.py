from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv, find_dotenv
import os

BASE_DIR = Path(__file__).resolve().parents[1]
DOTENV_PATH = BASE_DIR / '.env'
if not DOTENV_PATH.exists():
    DOTENV_PATH = Path(find_dotenv(usecwd=True))
    if not DOTENV_PATH.exists():
        DOTENV_PATH = None

if DOTENV_PATH:
    load_dotenv(DOTENV_PATH)

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise RuntimeError(
        'DATABASE_URL is not set. Please create backend/.env or export DATABASE_URL to point to your Neon/PostgreSQL database.'
    )

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()