from datetime import datetime


class OwnershipTracker:

    def __init__(self):
        self.records = []

    def add_record(self, filename, user, action):
        record = {
            "filename": filename,
            "user": user,
            "action": action,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        self.records.append(record)
        return record

    def get_records(self):
        return self.records