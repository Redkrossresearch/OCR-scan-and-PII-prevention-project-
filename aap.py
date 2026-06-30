from fastapi import FastAPI, UploadFile, File
import shutil
import os
from signature import DigitalSignatureVerifier
from watermark import WatermarkDetector
from tamper import TamperDetector
from fastapi import UploadFile, File, Form
from datetime import datetime
from risk import RiskAccessControl
from ownership import OwnershipTracker
from classification import DocumentClassifier
from dashboard import DashboardAnalytics
from report import ReportGenerator
from fastapi.responses import FileResponse
from scheduler import BatchReportScheduler
from expiry import DocumentExpiryManager
from audit import AuditLogger

app = FastAPI(
    title="OCR-Based DLP Backend",
    version="1.0"
)

tracker = OwnershipTracker()
risk_controller = RiskAccessControl()
classifier = DocumentClassifier()
dashboard = DashboardAnalytics()
report = ReportGenerator()
scheduler = BatchReportScheduler()
expiry_manager = DocumentExpiryManager()
audit_logger = AuditLogger()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "Backend Running"
    }


@app.post("/api/watermark/check")
async def watermark_check(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    detector = WatermarkDetector()

    result = detector.scan(file_path)

    return result


@app.post("/api/signature/verify")
async def verify_signature(file: UploadFile = File(...)):

    upload_folder = "uploads"
    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(upload_folder, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    verifier = DigitalSignatureVerifier()

    result = verifier.verify(file_path)

    return result

@app.post("/api/document/tamper-check")
async def tamper_check(
    file: UploadFile = File(...),
    original_hash: str = Form(...)
):

    upload_folder = "uploads"
    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(upload_folder, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    detector = TamperDetector()

    result = detector.verify(
        file_path,
        original_hash
    )

    return result

@app.post("/api/document/upload")
async def upload_document(
    user: str = Form(...),
    file: UploadFile = File(...)
):

    path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    record = tracker.add_record(
        filename=file.filename,
        user=user,
        action="Uploaded"
    )

    return {
        "success": True,
        "message": "Upload Successful",
        "record": record
    }

@app.get("/api/document/history")
def history():
    return {
        "success": True,
        "history": tracker.get_records()
    }

@app.post("/api/access/check")
def check_access(
    user_role: str = Form(...),
    risk_level: str = Form(...)
):

    result = risk_controller.check_access(
        user_role,
        risk_level
    )

    return result

@app.post("/api/document/classify")
async def classify_document(file: UploadFile = File(...)):

    content = await file.read()

    text = content.decode("utf-8", errors="ignore")

    return classifier.classify(text)

@app.get("/api/dashboard")
def get_dashboard():

    return dashboard.get_dashboard()

@app.get("/api/report/csv")
def generate_csv():

    file_path = report.generate_csv()

    return FileResponse(
        path=file_path,
        filename="report.csv",
        media_type="text/csv"
    )
@app.get("/api/report/pdf")
def generate_pdf():

    file_path = report.generate_pdf()

    return FileResponse(
        path=file_path,
        filename="report.pdf",
        media_type="application/pdf"
    )

@app.get("/api/scheduler/start")
def start_scheduler():

    return scheduler.start_scheduler()
@app.get("/api/scheduler/report")
def generate_report():

    file = scheduler.generate_report()

    return {
        "success": True,
        "report": file
    }

@app.post("/api/document/add")
def add_document(
    filename: str = Form(...),
    expiry_date: str = Form(...)
):

    return expiry_manager.add_document(
        filename,
        expiry_date
    )
@app.get("/api/document/expiry")
def check_expiry():

    return expiry_manager.check_expired()

@app.post("/api/audit/log")
def add_audit_log(
    user: str = Form(...),
    action: str = Form(...),
    document: str = Form(...)
):

    return audit_logger.add_log(
        user,
        action,
        document
    )

@app.get("/api/audit/logs")
def get_audit_logs():

    return audit_logger.get_logs()

