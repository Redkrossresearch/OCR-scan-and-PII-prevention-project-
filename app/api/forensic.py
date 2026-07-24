from fastapi import APIRouter, Form

from app.services.forensic_service import ForensicService
from sqlalchemy.orm import Session
from fastapi import Depends

from app.database.database import get_db

router = APIRouter(
    prefix="/forensic",
    tags=["Forensic Investigation"]
)


service = ForensicService()



@router.post("/record")
def create_record(
    user: str = Form(...),
    action: str = Form(...),
    document: str = Form(...),
    db: Session = Depends(get_db)
):
    return service.create_forensic_record(
    db,
    user,
    action,
    document
    )


@router.get("/logs")
def get_forensic_logs(
    db: Session = Depends(get_db)
):

    return service.get_forensic_logs(db)