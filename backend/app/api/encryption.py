import os
import shutil
import tempfile
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.services.encryption_service import EncryptionService

router = APIRouter(
    prefix="/encryption",
    tags=["Encryption"],
)


@router.post("/protect")
def protect_document(
    file: UploadFile = File(...),
    risk_level: str = Form(...),
    user_role: str = Form(...),
    uploaded_by: str = Form(""),
):
    if not EncryptionService.should_encrypt(risk_level):
        return {
            "encrypted": False,
            "message": f"Risk level '{risk_level}' does not require encryption.",
        }

    extension = file.filename.split(".")[-1] if "." in file.filename else ""

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{extension}") as temp:
            shutil.copyfileobj(file.file, temp)
            temp_path = temp.name

        result = EncryptionService.protect_file(temp_path, extension, user_role, uploaded_by)

        return {
            "encrypted": result["encrypted"],
            "password": result["password"],
            "hint": result["hint"],
            "authorized": result["authorized"],
            "message": result["message"],
            "protected_file": f"/uploads/protected/{Path(result['output_path']).name}",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)