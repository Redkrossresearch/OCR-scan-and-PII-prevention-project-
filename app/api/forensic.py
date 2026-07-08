from fastapi import APIRouter, Form

from app.services.forensic_service import ForensicService


router = APIRouter(
    prefix="/forensic",
    tags=["Forensic Investigation"]
)


service = ForensicService()



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