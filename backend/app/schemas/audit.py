from pydantic import BaseModel


class AuditLogCreate(BaseModel):
    user: str
    action: str
    details: str = ""


class AuditLogResponse(BaseModel):
    id: int
    user: str
    action: str
    details: str
    created_at: str

    class Config:
        from_attributes = True
