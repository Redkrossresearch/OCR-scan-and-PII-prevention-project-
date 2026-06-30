from datetime import datetime

class DocumentExpiryManager:

    def __init__(self):
        self.documents = []

    def add_document(self, filename, expiry_date):

        self.documents.append({
            "filename": filename,
            "expiry_date": expiry_date
        })

        return {
            "success": True,
            "message": "Document Added Successfully"
        }

    def check_expired(self):

        today = datetime.now().date()

        expired = []

        active = []

        for doc in self.documents:

            exp_date = datetime.strptime(
                doc["expiry_date"],
                "%Y-%m-%d"
            ).date()

            if exp_date < today:
                expired.append(doc)
            else:
                active.append(doc)

        return {
            "success": True,
            "expired_documents": expired,
            "active_documents": active
        }