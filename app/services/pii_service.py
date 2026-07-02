import re


class PIIDetector:

    PATTERNS = {
        "emails": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",

        "phone_numbers": r"\b(?:\+91[- ]?)?[6-9]\d{9}\b",

        "aadhaar_numbers": r"\b\d{4}\s?\d{4}\s?\d{4}\b",

        "pan_numbers": r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",

        "passport_numbers": r"\b[A-Z][0-9]{7}\b",

        "credit_cards": r"\b(?:\d{4}[- ]?){3}\d{4}\b",

        "ssn_numbers": r"\b\d{3}-\d{2}-\d{4}\b"
    }

    @staticmethod
    def detect(text: str):

        results = {}

        for key, pattern in PIIDetector.PATTERNS.items():
            results[key] = re.findall(pattern, text)

        return results