from pathlib import Path
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

SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-me')
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)