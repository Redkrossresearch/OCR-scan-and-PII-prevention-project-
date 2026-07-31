from fastapi import APIRouter, Form

from app.services.usb_control_service import USBControlService


router = APIRouter(
    prefix="/usb-control",
    tags=["USB Control"]
)


service = USBControlService()



@router.post("/check")
def check_usb(
    user_role: str = Form(...),
    device_name: str = Form(...)
):

    return service.check_usb_access(
        user_role,
        device_name
    )



@router.get("/logs")
def usb_logs():

    return service.get_usb_logs()