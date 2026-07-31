from datetime import datetime


class PolicyAlertService:


    @staticmethod
    def create_alert(data):

        return {
            "message": "Policy alert created",
            "alert": data
        }


    @staticmethod
    def get_alerts():

        return [
            {
                "id":1,
                "policy_name":"Sensitive Data Access",
                "severity":"High",
                "status":"Active",
                "created_at":datetime.utcnow()
            }
        ]