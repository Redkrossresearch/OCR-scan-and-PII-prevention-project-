from fastapi import APIRouter

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard & Analytics"]
)

# Temporary dashboard data
dashboard = {
    "total_documents": 0,
    "safe_documents": 0,
    "high_risk_documents": 0,
    "watermark_detected": 0,
    "digitally_signed": 0,
    "tampered_documents": 0,
    "blocked_documents": 0
}


@router.get("/")
def get_dashboard():

    return {
        "success": True,
        "dashboard": dashboard
    }


@router.post("/update")
def update_dashboard(
        safe=False,
        watermark=False,
        signature=False,
        tampered=False,
        blocked=False):

    dashboard["total_documents"] += 1

    if safe:
        dashboard["safe_documents"] += 1
    else:
        dashboard["high_risk_documents"] += 1

    if watermark:
        dashboard["watermark_detected"] += 1

    if signature:
        dashboard["digitally_signed"] += 1

    if tampered:
        dashboard["tampered_documents"] += 1

    if blocked:
        dashboard["blocked_documents"] += 1

    return {
        "message": "Dashboard updated",
        "dashboard": dashboard
    }