from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from app.database.database import Base


class PIIDetection(Base):

    __tablename__ = "pii_detections"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String, nullable=False)

    pii_type = Column(String, nullable=False)

    detected_value = Column(String, nullable=False)

    masked_value = Column(String)

    confidence_score = Column(Float)

    detected_at = Column(
        DateTime,
        default=datetime.utcnow
    )