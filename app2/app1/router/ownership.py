from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from datetime import datetime
import os

router = APIRouter(
    prefix="/ownership",
    tags=["Document Ownership Tracking"]
)

ownership_records = []

ALLOWED_FILES = [
    ".pdf",
    ".doc",
    ".docx",
    ".png",
    ".jpg",
    ".jpeg",
    ".txt"
]

@router.post("/track")
async def track_document(
    file: UploadFile = File(...),
    uploaded_by: str = Form(...),
    viewed_by: str = Form(""),
    downloaded_by: str = Form(""),
    modified_by: str = Form("")
):

    ext = os.path.splitext(file.filename)[1].lower()

    if ext not in ALLOWED_FILES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type."
        )

    record = {
        "document_name": file.filename,
        "file_type": ext,
        "file_size": len(await file.read()),
        "uploaded_by": uploaded_by,
        "viewed_by": viewed_by,
        "downloaded_by": downloaded_by,
        "modified_by": modified_by,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    ownership_records.append(record)

    return {
        "success": True,
        "message": "Ownership recorded successfully.",
        "ownership": record
    }


@router.get("/all")
async def get_records():

    return {
        "total_documents": len(ownership_records),
        "documents": ownership_records
    }