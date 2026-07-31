from pydantic import BaseModel


class ClipboardRequest(BaseModel):
    user: str
    content: str


class ClipboardResponse(BaseModel):
    blocked: bool
    reason: str