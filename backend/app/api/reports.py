import os

from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


@router.get("/csv")
def generate_csv():
    import csv
    os.makedirs("reports", exist_ok=True)
    file_path = "reports/report.csv"
    with open(file_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Feature", "Status"])
        writer.writerow(["Watermark", "Completed"])
        writer.writerow(["Signature", "Completed"])
        writer.writerow(["Tamper", "Completed"])
        writer.writerow(["Ownership", "Completed"])
        writer.writerow(["Risk", "Completed"])
    return FileResponse(path=file_path, filename="report.csv", media_type="text/csv")


@router.get("/pdf")
def generate_pdf():
    try:
        from reportlab.platypus import SimpleDocTemplate, Table
        os.makedirs("reports", exist_ok=True)
        file_path = "reports/report.pdf"
        document = SimpleDocTemplate(file_path)
        data = [
            ["Feature", "Status"],
            ["Watermark", "Completed"],
            ["Signature", "Completed"],
            ["Tamper", "Completed"],
            ["Ownership", "Completed"],
            ["Risk", "Completed"]
        ]
        table = Table(data)
        document.build([table])
        return FileResponse(path=file_path, filename="report.pdf", media_type="application/pdf")
    except ImportError:
        return {"error": "Install reportlab: pip install reportlab"}
