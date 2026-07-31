from fastapi import APIRouter

from app.services.policy_alert_service import PolicyAlertService
from app.schemas.policy_alert import PolicyAlertCreate


router = APIRouter(
    prefix="/policy-alerts",
    tags=["Policy Alerts"]
)


@router.post("/")
def create_policy_alert(
    alert: PolicyAlertCreate
):

    return PolicyAlertService.create_alert(
        alert.dict()
    )



@router.get("/")
def get_policy_alerts():

    return PolicyAlertService.get_alerts()