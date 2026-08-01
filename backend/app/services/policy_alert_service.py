from app.models.policy_alert import PolicyAlert


class PolicyAlertService:

    @staticmethod
    def create_alert(db, data):

        alert = PolicyAlert(
            user=data["user"],
            policy_name=data["policy_name"],
            severity=data.get("severity", "Medium"),
            description=data.get("description"),
            status=data.get("status", "Active"),
        )

        db.add(alert)
        db.commit()
        db.refresh(alert)

        return {
            "message": "Policy alert created",
            "alert": {
                "id": alert.id,
                "user": alert.user,
                "policy_name": alert.policy_name,
                "severity": alert.severity,
                "description": alert.description,
                "status": alert.status,
                "created_at": alert.created_at,
            }
        }

    @staticmethod
    def get_alerts(db):

        alerts = (
            db.query(PolicyAlert)
            .order_by(PolicyAlert.created_at.desc())
            .all()
        )

        return alerts