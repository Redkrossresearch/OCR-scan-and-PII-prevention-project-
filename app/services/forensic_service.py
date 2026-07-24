from app.models.forensic_log import ForensicLog
from datetime import datetime


class ForensicService:

    def __init__(self):
        pass

    def create_forensic_record(
        self,
        db,
        user,
        action,
        document
    ):

        new_log = ForensicLog(
            user=user,
            action=action,
            document=document,
            timestamp=datetime.now(),
            status="Recorded"
        )

        db.add(new_log)
        db.commit()
        db.refresh(new_log)

        return {
            "success": True,
            "message": "Forensic record created",
            "record": new_log
        }

    def get_forensic_logs(
        self,
        db
    ):

        logs = db.query(ForensicLog).all()

        return {
            "total_records": len(logs),
            "records": logs
        }