from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import hashlib

router = APIRouter(
    prefix="/tampering",
    tags=["Document Tampering Detection"]
)


def calculate_hash(data: bytes):
    return hashlib.sha256(data).hexdigest()


@router.post("/verify")
async def verify_document(
    file: UploadFile = File(...),
    original_hash: str = Form(...)
):
    try:
        file_data = await file.read()

        current_hash = calculate_hash(file_data)

        tampered = current_hash != original_hash

        return {
            "filename": file.filename,
            "current_hash": current_hash,
            "original_hash": original_hash,
            "tampered": tampered,
            "message": (
                "Document has been modified."
                if tampered
                else "Document is authentic."
            )
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))