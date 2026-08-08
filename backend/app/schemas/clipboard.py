from pydantic import BaseModel
from typing import Optional


class ClipboardRequest(BaseModel):
    user: str
    content: str


class ClipboardResponse(BaseModel):
    blocked: bool
    reason: str
    category: Optional[str] = None
    severity: Optional[str] = None
    rule_name: Optional[str] = None