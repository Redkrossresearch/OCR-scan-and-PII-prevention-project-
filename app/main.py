from fastapi import FastAPI

from app.database.database import engine
from app.database.base import Base
from app.api.auth import router as auth_router
from app.api.upload import router as upload_router
from app.api.ocr import router as ocr_router
from app.api.pii import router as pii_router
from fastapi.staticfiles import StaticFiles

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="OCR-Based DLP Backend",
    description="Backend API for OCR-Based Data Loss Prevention System",
    version="1.0.0"
)
app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(ocr_router)
app.include_router(pii_router)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

@app.get("/")
def root():
    return {
        "message": "OCR-Based DLP Backend is Running Successfully!"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "server": "running",
        "version": "1.0.0"
    }