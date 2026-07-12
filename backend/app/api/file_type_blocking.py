from fastapi import APIRouter, Form

from app.services.file_type_blocking_service import FileTypeBlockingService


router = APIRouter(
    prefix="/file-type",
    tags=["File Type Blocking"]
)


service = FileTypeBlockingService()



@router.post("/check")
def check_file_type(
    filename: str = Form(...)
):

    return service.check_file_type(
        filename
    )



@router.get("/logs")
def file_logs():

    return service.get_logs()