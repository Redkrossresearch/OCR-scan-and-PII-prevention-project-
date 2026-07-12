from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends
)

from app.schemas.upload import UploadResponse
from app.services.file_service import save_uploaded_file
from app.core.dependencies import get_current_user

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
    current_user: str = Depends(get_current_user)
):

    extension = file.filename.split(".")[-1].lower()

    if extension not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type"
        )

    filename = save_uploaded_file(file)

    return {
        "filename": filename,
        "message": f"Uploaded successfully by {current_user}"
    }