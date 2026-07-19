from fastapi import APIRouter, UploadFile, File, Form
from datetime import datetime, timedelta
import os
import shutil

router = APIRouter(
    prefix="/expiry",
    tags=["Document Expiry Management"]
)

UPLOAD_FOLDER = "uploads"
ARCHIVE_FOLDER = "archive"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(ARCHIVE_FOLDER, exist_ok=True)

documents = []

RETENTION_DAYS = 30


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    owner: str = Form(...)
):

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(filepath, "wb") as f:
        f.write(await file.read())

    documents.append({
        "filename": file.filename,
        "owner": owner,
        "uploaded_at": datetime.now(),
        "expiry_date": datetime.now() + timedelta(days=RETENTION_DAYS),
        "status": "Active"
    })

    return {
        "success": True,
        "message": "Document uploaded successfully.",
        "expiry_date": documents[-1]["expiry_date"]
    }


@router.get("/check")
def check_expiry():

    expired = []

    for doc in documents:

        if datetime.now() >= doc["expiry_date"]:

            source = os.path.join(UPLOAD_FOLDER, doc["filename"])
            destination = os.path.join(ARCHIVE_FOLDER, doc["filename"])

            if os.path.exists(source):
                shutil.move(source, destination)

            doc["status"] = "Archived"

            expired.append(doc)

    return {
        "expired_documents": expired,
        "total_archived": len(expired)
    }


@router.get("/all")
def all_documents():
    return documents