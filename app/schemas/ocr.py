from pydantic import BaseModel


class OCRResponse(BaseModel):
    filename: str
    file_type: str
    extracted_text: str