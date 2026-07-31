from sqlalchemy import Column, Integer, String, Float

from app.database.database import Base


class PIIDetection(Base):
    __tablename__ = "pii_detections"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, nullable=False)
    pii_type = Column(String, nullable=False)
    detected_value = Column(String, nullable=False)
    confidence = Column(Float, default=0.0)