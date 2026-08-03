import os
import uuid
from datetime import datetime

RECORDINGS_DIR = os.path.join("uploads", "recordings")


class SessionRecordingService:

    def __init__(self):
        os.makedirs(RECORDINGS_DIR, exist_ok=True)
        self.recordings = []

    def save_recording(self, user: str, document: str, file):

        filename = f"{uuid.uuid4().hex}.webm"
        filepath = os.path.join(RECORDINGS_DIR, filename)

        with open(filepath, "wb") as f:
            f.write(file.file.read())

        record = {
            "user": user,
            "document": document,
            "filename": filename,
            "url": f"/uploads/recordings/{filename}",
            "recorded_at": str(datetime.now()),
        }

        self.recordings.append(record)

        return {
            "success": True,
            "message": "Session recording saved",
            "record": record,
        }

    def get_recordings(self):

        return {
            "total_recordings": len(self.recordings),
            "recordings": list(reversed(self.recordings)),
        }