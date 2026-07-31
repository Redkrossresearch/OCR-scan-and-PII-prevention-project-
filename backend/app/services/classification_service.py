class ClassificationService:

    @staticmethod
    def classify(risk_level: str):

        mapping = {
            "LOW": "PUBLIC",
            "MEDIUM": "INTERNAL",
            "HIGH": "CONFIDENTIAL",
            "CRITICAL": "RESTRICTED",
        }

        return mapping.get(
            risk_level,
            "UNKNOWN",
        )