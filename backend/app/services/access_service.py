class AccessService:

    @staticmethod
    def evaluate(risk_level: str):

        if risk_level == "CRITICAL":

            return {
                "access_allowed": False,
                "reason": "Critical document"
            }

        return {
            "access_allowed": True,
            "reason": "Allowed"
        }