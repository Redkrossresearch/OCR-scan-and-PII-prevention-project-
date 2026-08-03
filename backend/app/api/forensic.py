from fastapi import APIRouter, Form, File, UploadFile

from app.services.forensic_service import ForensicService
from app.services.session_recording_service import SessionRecordingService


router = APIRouter(
    prefix="/forensic",
    tags=["Forensic Investigation"]
)


service = ForensicService()
recording_service = SessionRecordingService()



@router.post("/record")
def create_record(
    user: str = Form(...),
    action: str = Form(...),
    document: str = Form(...)
):

    return service.create_forensic_record(
        user,
        action,
        document
    )



@router.get("/logs")
def get_forensic_logs():

    return service.get_forensic_logs()



@router.post("/record-session")
def record_session(
    user: str = Form(...),
    document: str = Form("Live Session"),
    file: UploadFile = File(...),
):

    result = recording_service.save_recording(user, document, file)

    service.create_forensic_record(user, "SESSION_RECORDED", document)

    return result



@router.get("/recordings")
def list_recordings():

    return recording_service.get_recordings()