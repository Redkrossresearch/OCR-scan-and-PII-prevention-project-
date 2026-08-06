from app.services.pii_service import PIIDetector


class HighlightService:

    @staticmethod
    def generate(text: str):

        detected = PIIDetector.detect(text)

        highlights = []

        mapping = {
            "emails": "EMAIL",
            "phone_numbers": "PHONE",
            "aadhaar_numbers": "AADHAAR",
            "pan_numbers": "PAN",
            "passport_numbers": "PASSPORT",
            "credit_cards": "CREDIT_CARD",
            "ssn_numbers": "SSN",
            "ifsc_codes": "IFSC",
            "gstin_numbers": "GSTIN",
            "bank_account_numbers": "BANK_ACCOUNT",
        }

        for key, values in detected.items():

            for value in values:

                highlights.append(
                    {
                        "type": mapping.get(key, key.upper()),
                        "value": value
                    }
                )
        return highlights