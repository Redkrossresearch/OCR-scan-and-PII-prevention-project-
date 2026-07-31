import importlib
import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


def test_database_url_defaults_to_sqlite_when_not_set(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    module = importlib.import_module("app.database.database")

    assert module.DATABASE_URL == "sqlite:///./app.db"
