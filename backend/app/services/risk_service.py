class RiskService:

    WEIGHTS = {
        "emails": 1,
        "phone_numbers": 2,
        "passport_numbers": 4,
        "pan_numbers": 5,
        "aadhaar_numbers": 5,
        "credit_cards": 6,
        "ssn_numbers": 6,
        "ifsc_codes": 3,
        "gstin_numbers": 4,
        "bank_account_numbers": 5,
        "keywords": 1,
    }

    @staticmethod
    def calculate(pii_result: dict, keywords: list = None):

        if keywords is None:
            keywords = []

        score = 0
        breakdown = {}

        for key, values in pii_result.items():

            count = len(values)

            breakdown[key] = count

            score += count * RiskService.WEIGHTS.get(key, 1)

        keyword_count = len(keywords)

        breakdown["keywords"] = keyword_count

        score += keyword_count * RiskService.WEIGHTS["keywords"]

        if score <= 20:
            level = "LOW"

        elif score <= 40:
            level = "MEDIUM"

        elif score <= 60:
            level = "HIGH"

        else:
            level = "CRITICAL"

        return {
            "risk_score": score,
            "risk_level": level,
            "risk_breakdown": breakdown,
        }
