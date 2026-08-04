from sqlalchemy.orm import Session

from app.models.forensic_log import ForensicLog


class ForensicService:

    @staticmethod
    def create_forensic_record(db: Session, user: str, action: str, document: str):
        entry = ForensicLog(user=user, action=action, document=document)
        db.add(entry)
        db.commit()
        db.refresh(entry)

        return {
            "success": True,
            "message": "Forensic record created",
            "record": {
                "user": entry.user,
                "action": entry.action,
                "document": entry.document,
                "timestamp": str(entry.created_at),
                "status": "Recorded",
            },
        }

    @staticmethod
    def get_forensic_logs(db: Session):
        logs = db.query(ForensicLog).order_by(ForensicLog.created_at.desc()).all()

        return {
            "total_records": len(logs),
            "records": [
                {
                    "user": l.user,
                    "action": l.action,
                    "document": l.document,
                    "timestamp": str(l.created_at),
                    "status": "Recorded",
                }
                for l in logs
            ],
        }