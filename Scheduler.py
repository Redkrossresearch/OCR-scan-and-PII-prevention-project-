from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import os

class BatchReportScheduler:

    def __init__(self):
        self.scheduler = BackgroundScheduler()

    def generate_report(self):

        os.makedirs("reports", exist_ok=True)

        filename = f"reports/report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"

        with open(filename, "w") as file:
            file.write("OCR-Based DLP Report\n")
            file.write("----------------------\n")
            file.write(f"Generated: {datetime.now()}\n")
            file.write("Status: Success\n")

        return filename

    def start_scheduler(self):

        if not self.scheduler.running:
            self.scheduler.add_job(
                self.generate_report,
                "interval",
                minutes=1
            )
            self.scheduler.start()

        return {
            "success": True,
            "message": "Batch Scheduler Started"
        }