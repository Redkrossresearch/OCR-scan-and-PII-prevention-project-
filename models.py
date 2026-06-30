from sqlalchemy import Column, Integer, String, DateTime
from database import Base
from datetime import datetime


class DocumentOwnership(Base):
    __tablename__ = "document_ownership"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    uploader = Column(String, nullable=False)
    action = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)