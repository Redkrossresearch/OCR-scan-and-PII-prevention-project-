from fastapi import APIRouter, Form

from app.services.ueba_service import UEBAService


router = APIRouter(
    prefix="/ueba",
    tags=["UEBA"]
)


service = UEBAService()



@router.post("/analyze")
def analyze_user_behavior(
    user: str = Form(...),
    action: str = Form(...),
    access_count: int = Form(...)
):

    return service.analyze_behavior(
        user,
        action,
        access_count
    )



@router.get("/logs")
def get_ueba_logs():

    return service.get_activity_logs()