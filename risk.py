class RiskAccessControl:

    def __init__(self):
        self.risk_levels = {
            "low": ["viewer", "employee", "manager", "admin"],
            "medium": ["manager", "admin"],
            "high": ["admin"]
        }

    def check_access(self, user_role, risk_level):

        user_role = user_role.lower()
        risk_level = risk_level.lower()

        allowed = self.risk_levels.get(risk_level, [])

        if user_role in allowed:
            return {
                "success": True,
                "access": "Granted",
                "role": user_role,
                "risk_level": risk_level
            }

        return {
            "success": False,
            "access": "Denied",
            "role": user_role,
            "risk_level": risk_level
        }