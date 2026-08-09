from app.services.pii_service import PIIDetector
from app.services.keyword_service import KeywordService


class EmailService:

    PII_LABELS = {
        "emails": "email",
        "phone_numbers": "phone",
        "aadhaar_numbers": "aadhaar",
        "pan_numbers": "pan",
        "passport_numbers": "passport",
        "credit_cards": "credit_card",
        "ssn_numbers": "ssn",
        "ifsc_codes": "ifsc",
        "gstin_numbers": "gstin",
        "bank_account_numbers": "bank_account",
    }

    HIGH_RISK_TYPES = {
        "aadhaar_numbers", "pan_numbers", "credit_cards", "ssn_numbers",
        "passport_numbers", "gstin_numbers", "bank_account_numbers",
    }

    @staticmethod
    def scan_email(data):

        content = data["content"]

        pii_matches = PIIDetector.detect(content)
        keyword_categories = KeywordService.detect_categories(content)

        detected = []
        high_risk_hit = False

        for pii_type, values in pii_matches.items():
            if values:
                detected.append(EmailService.PII_LABELS.get(pii_type, pii_type))
                if pii_type in EmailService.HIGH_RISK_TYPES:
                    high_risk_hit = True

        detected.extend(keyword_categories)

        sensitive_found = bool(detected)

        if high_risk_hit:
            risk_level = "High"
        elif sensitive_found:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        return {
            "risk_level": risk_level,
            "sensitive_data_found": sensitive_found,
            "detected_types": detected,
            "message": "Email scan completed"
        }