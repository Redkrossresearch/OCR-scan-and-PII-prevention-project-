from fastapi import FastAPI
from router.watermark import router as watermark_router
from router.signature import router as signature_router
from router.tampering import router as tampering_router
from router.ownership import router as ownership_router
from router.access import router as access_router
from router.audit import router as audit_router
from router.dashboard import router as dashboard_router
from router.report import router as report_router
from router.scheduler import router as scheduler_router
from router.expiry import router as expiry_router


app = FastAPI(title="OCR DLP")

app.include_router(watermark_router)
app.include_router(signature_router)
app.include_router(tampering_router)
app.include_router(ownership_router)
app.include_router(access_router)
app.include_router(audit_router)
app.include_router(dashboard_router)
app.include_router(report_router)
app.include_router(scheduler_router)
app.include_router(expiry_router)