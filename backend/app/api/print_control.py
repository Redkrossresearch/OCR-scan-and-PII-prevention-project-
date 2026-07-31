from fastapi import APIRouter, Form

from app.services.print_control_service import PrintControlService


router = APIRouter(
    prefix="/print-control",
    tags=["Print Control"]
)


service = PrintControlService()


@router.post("/check")
def check_print(
    user_role: str = Form(...),
    document_type: str = Form(...)
):

    return service.check_print_permission(
        user_role,
        document_type
    )


@router.get("/logs")
def print_logs():

    return service.get_print_logs()