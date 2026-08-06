from pydantic import BaseModel


class HighlightItem(BaseModel):
    type: str
    value: str


class PIIResponse(BaseModel):

    emails: list[str]

    phone_numbers: list[str]

    aadhaar_numbers: list[str]

    pan_numbers: list[str]

    passport_numbers: list[str]

    credit_cards: list[str]

    ssn_numbers: list[str]

    ifsc_codes: list[str]

    gstin_numbers: list[str]

    bank_account_numbers: list[str]

    highlights: list[HighlightItem]

    highlighted_file: str

    keywords: list[str]

    risk_score: int

    risk_level: str

    risk_breakdown: dict

    classification: str

    edm_matches: dict

    is_password_protected: bool

    needs_password: bool

    is_encrypted: bool

    watermark_detected: bool

    watermark_details: list

    digital_signature_present: bool

    digital_signatures: list

    tampered: bool

    tamper_reasons: list

    owner: str

    creator: str

    producer: str

    company: str

    access_allowed: bool

    access_reason: str