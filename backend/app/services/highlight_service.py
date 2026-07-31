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
        }

        for key, values in detected.items():

            for value in values:

                highlights.append(
                    {
                        "type": mapping[key],
                        "value": value
                    }
                )

        return highlights