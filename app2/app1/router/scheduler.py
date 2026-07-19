from fastapi import APIRouter
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import os

router = APIRouter(
    prefix="/scheduler",
    tags=["Batch Report Scheduler"]
)

REPORT_FOLDER = "reports"
os.makedirs(REPORT_FOLDER, exist_ok=True)

scheduler = BackgroundScheduler()


def generate_batch_report():

    filename = f"Batch_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"

    path = os.path.join(REPORT_FOLDER, filename)

    with open(path, "w") as file:
        file.write("OCR DLP Batch Report\n")
        file.write("=====================\n")
        file.write(f"Generated : {datetime.now()}\n")
        file.write("Status : Success\n")
        file.write("Automatic Scheduled Report\n")


scheduler.add_job(
    generate_batch_report,
    "interval",
    minutes=1
)

scheduler.start()


@router.get("/status")
def scheduler_status():

    return {
        "scheduler": "Running",
        "interval": "Every 1 Minute",
        "report_folder": REPORT_FOLDER
    }