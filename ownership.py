from models import DocumentOwnership
from database import SessionLocal


class OwnershipTracker:

    def add_record(self, filename, user, action):

        db = SessionLocal()

        record = DocumentOwnership(
            filename=filename,
            uploader=user,
            action=action
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        db.close()

        return {
            "id": record.id,
            "filename": record.filename,
            "user": record.uploader,
            "action": record.action,
            "timestamp": record.timestamp
        }

    def get_records(self):

        db = SessionLocal()

        records = db.query(DocumentOwnership).all()

        result = []

        for record in records:

            result.append({

                "id": record.id,
                "filename": record.filename,
                "user": record.uploader,
                "action": record.action,
                "timestamp": record.timestamp

            })

        db.close()

        return result