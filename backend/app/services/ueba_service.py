class UEBAService:

    def __init__(self):
        self.user_activity = []


    def analyze_behavior(
        self,
        user: str,
        action: str,
        access_count: int
    ):

        if access_count > 75:
            risk_level = "Critical"

        elif access_count > 50:
            risk_level = "High"

        elif access_count > 25:
            risk_level = "Medium"

        else:
            risk_level = "Low"


        record = {
            "user": user,
            "action": action,
            "access_count": access_count,
            "risk_level": risk_level
        }


        self.user_activity.append(record)


        return {
            "user": user,
            "risk_level": risk_level,
            "message": f"User behavior analyzed with {risk_level} risk",
            "input": {"action": action, "access_count": access_count}
        }



    def get_activity_logs(self):

        return {
            "total_records": len(self.user_activity),
            "activities": self.user_activity
        }