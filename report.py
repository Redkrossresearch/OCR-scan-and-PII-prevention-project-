import os
import csv
from reportlab.platypus import SimpleDocTemplate, Table

class ReportGenerator:

    def generate_csv(self):

        os.makedirs("reports", exist_ok=True)

        file_path = "reports/report.csv"

        with open(file_path, "w", newline="") as file:

            writer = csv.writer(file)

            writer.writerow(["Feature", "Status"])

            writer.writerow(["Watermark", "Completed"])
            writer.writerow(["Signature", "Completed"])
            writer.writerow(["Tamper", "Completed"])
            writer.writerow(["Ownership", "Completed"])
            writer.writerow(["Risk", "Completed"])

        return file_path


    def generate_pdf(self):

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

        return file_path