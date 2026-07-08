from pydantic import BaseModel
from datetime import datetime


class PolicyAlertCreate(BaseModel):

    user: str
    policy_name: str
    severity: str
    description: str


class PolicyAlertResponse(BaseModel):

    id: int
    user: str
    policy_name: str
    severity: str
    description: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True