from fastapi import APIRouter

from app.schemas.clipboard import ClipboardRequest
from app.services.clipboard_service import ClipboardService


router = APIRouter(
    prefix="/clipboard",
    tags=["Clipboard Control"]
)



@router.post("/check")
def check_clipboard(
    data: ClipboardRequest
):

    return ClipboardService.check_clipboard(
        data.dict()
    )



@router.get("/")
def clipboard_status():

    return {
        "message": "Clipboard Control API running"
    }