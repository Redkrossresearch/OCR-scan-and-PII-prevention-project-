from datetime import datetime

class AuditLogger:

    def __init__(self):
        self.logs = []

    def add_log(self, user, action, document):

        log = {
            "user": user,
            "action": action,
            "document": document,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        self.logs.append(log)

        return {
            "success": True,
            "message": "Audit log added successfully.",
            "log": log
        }

    def get_logs(self):

        return {
            "success": True,
            "total_logs": len(self.logs),
            "logs": self.logs
        }