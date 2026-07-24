from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database.database import Base


class ForensicLog(Base):
    __tablename__ = "forensic_logs"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String, nullable=False)
    action = Column(String, nullable=False)
    document = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Recorded")