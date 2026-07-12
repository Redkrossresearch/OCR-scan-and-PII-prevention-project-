from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

from app.database.database import Base


class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, nullable=False)
    extracted_text = Column(Text)
    risk_score = Column(Integer, default=0)
    risk_level = Column(String, default="Low")
    scanned_at = Column(DateTime, default=datetime.utcnow)