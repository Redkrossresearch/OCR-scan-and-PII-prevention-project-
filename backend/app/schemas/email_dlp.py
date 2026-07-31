from pydantic import BaseModel


class EmailScanRequest(BaseModel):
    sender: str
    receiver: str
    subject: str
    content: str


class EmailScanResponse(BaseModel):
    risk_level: str
    sensitive_data_found: bool
    message: str