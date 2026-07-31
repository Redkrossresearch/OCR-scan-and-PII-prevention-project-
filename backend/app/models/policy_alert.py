from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database.database import Base


class PolicyAlert(Base):

    __tablename__ = "policy_alerts"

    id = Column(Integer, primary_key=True, index=True)

    user = Column(String, nullable=False)

    policy_name = Column(String, nullable=False)

    severity = Column(String, default="Medium")

    description = Column(String)

    status = Column(
        String,
        default="Active"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )