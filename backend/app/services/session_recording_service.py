import os
import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.session_recording import SessionRecording

RECORDINGS_DIR = os.path.join("uploads", "recordings")


class SessionRecordingService:

    def __init__(self):
        os.makedirs(RECORDINGS_DIR, exist_ok=True)

    def save_recording(self, db: Session, user: str, document: str, file):

        filename = f"{uuid.uuid4().hex}.webm"
        filepath = os.path.join(RECORDINGS_DIR, filename)

        with open(filepath, "wb") as f:
            f.write(file.file.read())

        entry = SessionRecording(
            user=user,
            document=document,
            filename=filename,
            url=f"/uploads/recordings/{filename}",
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)

        return {
            "success": True,
            "message": "Session recording saved",
            "record": {
                "user": entry.user,
                "document": entry.document,
                "filename": entry.filename,
                "url": entry.url,
                "recorded_at": str(entry.created_at),
            },
        }

    def get_recordings(self, db: Session):

        records = (
            db.query(SessionRecording)
            .order_by(SessionRecording.created_at.desc())
            .all()
        )

        return {
            "total_recordings": len(records),
            "recordings": [
                {
                    "user": r.user,
                    "document": r.document,
                    "filename": r.filename,
                    "url": r.url,
                    "recorded_at": str(r.created_at),
                }
                for r in records
            ],
        }