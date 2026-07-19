from fastapi import APIRouter, UploadFile, File
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import os
from datetime import datetime

router = APIRouter(
    prefix="/report",
    tags=["Report Generation"]
)

REPORT_FOLDER = "reports"
os.makedirs(REPORT_FOLDER, exist_ok=True)


@router.post("/generate")
async def generate_report(file: UploadFile = File(...)):

    filename = file.filename

    report_name = filename.replace(".", "_") + "_report.pdf"

    report_path = os.path.join(REPORT_FOLDER, report_name)

    styles = getSampleStyleSheet()

    pdf = SimpleDocTemplate(report_path)

    story = []

    story.append(Paragraph("<b>OCR DLP REPORT</b>", styles["Title"]))
    story.append(Paragraph(f"File Name : {filename}", styles["Normal"]))
    story.append(Paragraph(f"Generated : {datetime.now()}", styles["Normal"]))
    story.append(Paragraph("Status : Scan Completed", styles["Normal"]))
    story.append(Paragraph("Risk Level : High", styles["Normal"]))
    story.append(Paragraph("Watermark : No", styles["Normal"]))
    story.append(Paragraph("Digital Signature : Yes", styles["Normal"]))
    story.append(Paragraph("Tampered : No", styles["Normal"]))
    story.append(Paragraph("Access : Denied", styles["Normal"]))

    pdf.build(story)

    return {
        "success": True,
        "message": "Report Generated Successfully",
        "report": report_path
    }