from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database.database import Base


class SessionRecording(Base):
    __tablename__ = "session_recordings"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String, nullable=False)
    document = Column(String, nullable=True)
    filename = Column(String, nullable=False)
    url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)