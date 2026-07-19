from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(
    prefix="/audit",
    tags=["Audit Logs"]
)

audit_logs = []

class AuditLog(BaseModel):
    username: str
    action: str
    filename: str
    status: str


@router.post("/add")
def add_log(log: AuditLog):

    record = {
        "username": log.username,
        "action": log.action,
        "filename": log.filename,
        "status": log.status,
        "timestamp": datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    }

    audit_logs.append(record)

    return {
        "success": True,
        "message": "Audit log created successfully.",
        "log": record
    }


@router.get("/all")
def get_logs():

    return {
        "total_logs": len(audit_logs),
        "logs": audit_logs
    }