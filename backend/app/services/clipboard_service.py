from app.services.pii_service import PIIDetector
from app.services.keyword_service import KeywordService


class ClipboardService:

    PII_LABELS = {
        "emails": "Email",
        "phone_numbers": "Phone Number",
        "aadhaar_numbers": "Aadhaar",
        "pan_numbers": "PAN",
        "passport_numbers": "Passport Number",
        "credit_cards": "Credit Card",
        "ssn_numbers": "SSN",
        "ifsc_codes": "IFSC Code",
        "gstin_numbers": "GSTIN",
        "bank_account_numbers": "Bank Account Number",
    }

    @staticmethod
    def check_clipboard(data):

        content = data["content"]

        pii_matches = PIIDetector.detect(content)
        keyword_categories = KeywordService.detect_categories(content)

        detected = [
            ClipboardService.PII_LABELS.get(pii_type, pii_type)
            for pii_type, values in pii_matches.items()
            if values
        ]

        detected.extend(keyword_categories)

        if detected:
            return {
                "blocked": True,
                "reason": f"Clipboard blocked. Sensitive data detected: {', '.join(detected)}",
                "detected_types": detected,
            }

        return {
            "blocked": False,
            "reason": "Clipboard content is safe",
            "detected_types": [],
        }