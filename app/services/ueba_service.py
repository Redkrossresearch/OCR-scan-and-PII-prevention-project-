class UEBAService:

    def __init__(self):
        self.user_activity = []


    def analyze_behavior(
        self,
        user: str,
        action: str,
        access_count: int
    ):

        risk_level = "Low"

        if access_count > 50:
            risk_level = "High"

        elif access_count > 20:
            risk_level = "Medium"


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
            "message": f"User behavior analyzed with {risk_level} risk"
        }



    def get_activity_logs(self):

        return {
            "total_records": len(self.user_activity),
            "activities": self.user_activity
        }