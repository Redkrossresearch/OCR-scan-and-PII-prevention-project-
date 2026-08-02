from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException,
    Depends
)
from sqlalchemy.orm import Session

from app.schemas.upload import UploadResponse
from app.services.file_service import save_uploaded_file
from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.services.audit_service import AuditService
from datetime import datetime, timedelta
from app.models.document import Document

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)

ALLOWED_TYPES = [
    "pdf",
    "png",
    "jpg",
    "jpeg"
]


@router.post(
    "/",
    response_model=UploadResponse
)
def upload_document(
    file: UploadFile = File(...),
    expiry_days: int = Form(None),
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    extension = file.filename.split(".")[-1].lower()

    # Check file type
    if extension not in ALLOWED_TYPES:
        AuditService.log(
            db,
            current_user,
            "UPLOAD_REJECTED",
            "Rejected upload of '%s' (unsupported type '.%s')" %
            (file.filename, extension),
        )

        raise HTTPException(
            status_code=400,
            detail="Unsupported file type"
        )

    # Save uploaded file
    filename = save_uploaded_file(file)

    # Create document record in database
    expiry_date = None
    if expiry_days:
        expiry_date = datetime.utcnow() + timedelta(days=expiry_days)

    document = Document(
        filename=filename,
        filepath="uploads/%s" % filename,
        file_type=extension,
        uploaded_by=current_user,
        expiry_date=expiry_date,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    # Create audit log
    AuditService.log(
        db,
        current_user,
        "DOCUMENT_UPLOADED",
        "Uploaded '%s' as '%s'" %
        (file.filename, filename),
    )

    return {
        "filename": filename,
        "message": f"Uploaded successfully by {current_user}"
    }