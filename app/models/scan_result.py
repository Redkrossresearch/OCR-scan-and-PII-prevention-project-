from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database.database import Base


class ScanResult(Base):

    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String, nullable=False)

    extracted_text = Column(String, nullable=False)

    risk_score = Column(Integer, default=0)

    risk_level = Column(String, default="Low")

    classification = Column(String)

    scanned_at = Column(
        DateTime,
        default=datetime.utcnow
    )