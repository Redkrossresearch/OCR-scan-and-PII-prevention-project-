from pydantic import BaseModel
from typing import List, Optional


class PIIResult(BaseModel):
    type: str
    value: str
    risk: Optional[str] = None


class QRBarcodeResult(BaseModel):
    type: str
    data: str
    page: Optional[int] = None
    pii_detected: List[PIIResult] = []


class QRBarcodeResponse(BaseModel):
    success: bool
    codes_detected: int
    results: List[QRBarcodeResult]