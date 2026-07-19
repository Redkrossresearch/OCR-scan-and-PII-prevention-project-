from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(
    prefix="/access",
    tags=["Risk-Based Access Restriction"]
)

class AccessRequest(BaseModel):
    username: str
    role: str
    risk_level: str


@router.post("/check")
def check_access(data: AccessRequest):

    role = data.role.lower()
    risk = data.risk_level.lower()

    access = False

    if role == "admin":
        access = True

    elif role == "manager":
        if risk in ["low", "medium", "high"]:
            access = True

    elif role == "employee":
        if risk == "low":
            access = True

    return {
        "username": data.username,
        "role": data.role,
        "risk_level": data.risk_level,
        "access": "Granted" if access else "Denied",
        "success": access
    }