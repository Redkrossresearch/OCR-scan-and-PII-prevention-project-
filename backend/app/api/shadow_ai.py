from fastapi import APIRouter, Form

from app.services.shadow_ai_service import ShadowAIService


router = APIRouter(
    prefix="/shadow-ai",
    tags=["Shadow AI Detection"]
)


service = ShadowAIService()



@router.post("/detect")
def detect_shadow_ai(
    application_name: str = Form(...),
    user: str = Form(...)
):

    return service.detect_ai_usage(
        application_name,
        user
    )



@router.get("/logs")
def shadow_ai_logs():

    return service.get_logs()