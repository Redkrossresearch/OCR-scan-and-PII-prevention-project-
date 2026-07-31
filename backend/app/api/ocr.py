import os
import tempfile

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends
)
from sqlalchemy.orm import Session

from app.schemas.ocr import OCRResponse
from app.services.ocr_service import (
    extract_text_from_image,
    extract_text_from_pdf
)

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.services.audit_service import AuditService

router = APIRouter(
    prefix="/ocr",
    tags=["OCR"]
)


ALLOWED_TYPES = [
    "pdf",
    "png",
    "jpg",
    "jpeg"
]


@router.post(
    "/extract-text",
    response_model=OCRResponse
)
def extract_text(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    extension = file.filename.split(".")[-1].lower()

    if extension not in ALLOWED_TYPES:

        raise HTTPException(
            status_code=400,
            detail="Unsupported file type"
        )

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=f".{extension}"
    ) as temp:

        temp.write(file.file.read())

        temp_path = temp.name

    try:

        if extension == "pdf":

            text = extract_text_from_pdf(
                temp_path
            )

        else:

            text = extract_text_from_image(
                temp_path
            )

        AuditService.log(
            db,
            current_user,
            "OCR_EXTRACTED",
            "Extracted %d characters from '%s'" % (len(text), file.filename),
        )

        return {
            "filename": file.filename,
            "file_type": extension,
            "extracted_text": text
        }

    finally:

        if os.path.exists(temp_path):
            os.remove(temp_path)