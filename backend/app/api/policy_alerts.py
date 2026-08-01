from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.services.policy_alert_service import PolicyAlertService
from app.schemas.policy_alert import PolicyAlertCreate
from app.database.database import get_db


router = APIRouter(
    prefix="/policy-alerts",
    tags=["Policy Alerts"]
)


@router.post("/")
def create_policy_alert(
    alert: PolicyAlertCreate,
    db: Session = Depends(get_db),
):

    return PolicyAlertService.create_alert(
        db,
        alert.dict()
    )


@router.get("/")
def get_policy_alerts(
    db: Session = Depends(get_db),
):

    return PolicyAlertService.get_alerts(db)