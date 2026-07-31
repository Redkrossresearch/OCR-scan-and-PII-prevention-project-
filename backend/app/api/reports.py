import os

from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.services.audit_service import AuditService
from app.services.csv_report_service import build_report_csv
from app.services.pdf_report_service import build_report_pdf

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


def _report_id_suffix():
    from datetime import datetime
    return datetime.now().strftime("%Y%m%d%H%M%S")


@router.post("/pdf")
def generate_pdf_report(
    report: dict,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate an enterprise-grade Cybersecurity / DLP Assessment PDF."""
    try:
        pdf_buffer, report_id = build_report_pdf(report)
        AuditService.log(
            db,
            current_user,
            "REPORT_GENERATED",
            "Generated PDF assessment report %s for document '%s'"
            % (report_id, (report.get("document") or {}).get("filename", "")),
        )
        headers = {
            "Content-Disposition": 'attachment; filename="%s.pdf"' % report_id,
        }
        return Response(
            content=pdf_buffer.getvalue(),
            media_type="application/pdf",
            headers=headers,
        )
    except Exception as exc:
        return Response(
            content='{"detail": "PDF generation failed: %s"}' % str(exc).replace('"', "'"),
            media_type="application/json",
            status_code=500,
        )


@router.post("/csv")
def generate_csv_report(
    report: dict,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a structured, tabular CSV export of the assessment."""
    try:
        csv_content = build_report_csv(report)
        filename = "dlp-assessment-%s.csv" % _report_id_suffix()
        AuditService.log(
            db,
            current_user,
            "REPORT_EXPORTED",
            "Exported CSV report '%s' for document '%s'"
            % (filename, (report.get("document") or {}).get("filename", "")),
        )
        headers = {
            "Content-Disposition": 'attachment; filename="%s"' % filename,
        }
        return Response(
            content=csv_content,
            media_type="text/csv; charset=utf-8",
            headers=headers,
        )
    except Exception as exc:
        return Response(
            content='{"detail": "CSV generation failed: %s"}' % str(exc).replace('"', "'"),
            media_type="application/json",
            status_code=500,
        )


# Legacy GET endpoints (kept for backward compatibility)
@router.get("/csv")
def generate_csv_legacy():
    import csv
    os.makedirs("reports", exist_ok=True)
    file_path = "reports/report.csv"
    with open(file_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Section", "Field", "Value"])
        writer.writerow(["Report", "Status", "No analysis available. Run Analyze Document on the OCR page first."])
    return FileResponse(path=file_path, filename="report.csv", media_type="text/csv")


@router.get("/pdf")
def generate_pdf_legacy():
    try:
        from reportlab.platypus import SimpleDocTemplate, Paragraph
        from reportlab.lib.styles import getSampleStyleSheet
        os.makedirs("reports", exist_ok=True)
        file_path = "reports/report.pdf"
        document = SimpleDocTemplate(file_path)
        styles = getSampleStyleSheet()
        content = [Paragraph("DLP Assessment Report", styles["Title"])]
        content.append(Paragraph("No analysis available. Run Analyze Document on the OCR page first.", styles["Normal"]))
        document.build(content)
        return FileResponse(path=file_path, filename="report.pdf", media_type="application/pdf")
    except ImportError:
        return {"error": "Install reportlab: pip install reportlab"}
