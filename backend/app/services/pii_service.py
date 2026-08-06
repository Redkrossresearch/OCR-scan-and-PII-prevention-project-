import re


class PIIDetector:

    PATTERNS = {
        "emails": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",

        "phone_numbers": r"\b(?:\+91[- ]?)?[6-9]\d{9}\b",

        "aadhaar_numbers": r"\b\d{4}\s?\d{4}\s?\d{4}\b",

        "pan_numbers": r"\b[A-Za-z]{5}[0-9]{4}[A-Za-z]\b",

        "passport_numbers": r"\b[A-Za-z][0-9]{7}\b",

        "credit_cards": r"\b(?:4[0-9]{3}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{1,4}|5[1-5][0-9]{2}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}|3[47][0-9]{2}[- ]?[0-9]{6}[- ]?[0-9]{5}|3(?:0[0-5]|[68][0-9])[0-9][- ]?[0-9]{6}[- ]?[0-9]{4}|6(?:011|5[0-9]{2})[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4})\b",

        "ssn_numbers": r"\b\d{3}-\d{2}-\d{4}\b",

        "ifsc_codes": r"\b[A-Za-z]{4}0[A-Za-z0-9]{6}\b",

        "gstin_numbers": r"\b\d{2}[A-Za-z]{5}\d{4}[A-Za-z]{1}[1-9A-Za-z]{1}Z[0-9A-Za-z]{1}\b",

        "bank_account_numbers": r"\b\d{9,18}\b",
    }

    @staticmethod
    def detect(text: str):

        results = {}

        for key, pattern in PIIDetector.PATTERNS.items():
            results[key] = re.findall(pattern, text, flags=re.IGNORECASE)

        return results