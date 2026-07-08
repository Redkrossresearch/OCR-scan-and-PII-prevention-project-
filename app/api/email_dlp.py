from fastapi import APIRouter

from app.schemas.email_dlp import EmailScanRequest
from app.services.email_service import EmailService


router = APIRouter(
    prefix="/email-dlp",
    tags=["Email DLP"]
)



@router.post("/scan")
def scan_email(
    email: EmailScanRequest
):

    result = EmailService.scan_email(
        email.dict()
    )

    return result



@router.get("/")
def email_status():

    return {
        "message": "Email DLP service running"
    }