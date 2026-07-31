from datetime import datetime


class ForensicService:

    def __init__(self):
        self.forensic_logs = []


    def create_forensic_record(
        self,
        user: str,
        action: str,
        document: str
    ):

        record = {
            "user": user,
            "action": action,
            "document": document,
            "timestamp": str(datetime.now()),
            "status": "Recorded"
        }


        self.forensic_logs.append(record)


        return {
            "success": True,
            "message": "Forensic record created",
            "record": record
        }



    def get_forensic_logs(self):

        return {
            "total_records": len(self.forensic_logs),
            "records": self.forensic_logs
        }