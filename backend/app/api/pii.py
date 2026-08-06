import os
import tempfile
from pathlib import Path

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends,
)
from sqlalchemy.orm import Session

from app.schemas.pii import PIIResponse

from app.services.pii_service import PIIDetector
from app.services.highlight_service import HighlightService
from app.services.document_highlight_service import DocumentHighlightService
from app.services.redaction_service import RedactionService
from app.services.blur_service import BlurService
from app.services.keyword_service import KeywordService
from app.services.risk_service import RiskService
from app.services.classification_service import ClassificationService
from app.services.edm_service import EDMService
from app.services.pdf_security_service import PDFSecurityService
from app.services.watermark_service import WatermarkService
from app.services.signature_service import SignatureService
from app.services.tamper_service import TamperService
from app.services.ownership_service import OwnershipService
from app.services.access_service import AccessService

from app.services.ocr_service import (
    extract_text_from_image,
    extract_text_from_pdf,
    extract_image_data,
    extract_pdf_data,
)

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.services.audit_service import AuditService
from app.models.document import Document
from app.models.scan_result import ScanResult
from app.models.pii_detection import PIIDetection


router = APIRouter(
    prefix="/pii",
    tags=["PII Detection"],
)

ALLOWED_TYPES = [
    "pdf",
    "png",
    "jpg",
    "jpeg",
]


@router.post(
    "/detect",
    response_model=PIIResponse,
)
def detect_pii(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    extension = file.filename.split(".")[-1].lower()

    if extension not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type",
        )

    temp_path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=f".{extension}",
        ) as temp:

            temp.write(file.file.read())
            temp_path = temp.name

        if extension == "pdf":

            extracted_text = extract_text_from_pdf(temp_path)
            ocr_data = extract_pdf_data(temp_path)

        else:

            extracted_text = extract_text_from_image(temp_path)
            ocr_data = extract_image_data(temp_path)

        pdf_security = {
            "is_password_protected": False,
            "needs_password": False,
            "is_encrypted": False,
        }

        if extension == "pdf":
            pdf_security = PDFSecurityService.analyze(temp_path)

        result = PIIDetector.detect(extracted_text)

        highlights = HighlightService.generate(extracted_text)

        if extension == "pdf":
            # Skip image highlighting for PDFs for now
            highlighted_path = temp_path
        else:

            highlighted_path = DocumentHighlightService.highlight(
                temp_path,
                result,
                ocr_data,
            )

        keywords = KeywordService.detect(extracted_text)

        risk = RiskService.calculate(
            result,
            keywords,
        )

        classification = ClassificationService.classify(
            risk["risk_level"]
        )

        edm_matches = EDMService.match(result)

        watermark = {
            "watermark_detected": False,
            "watermark_details": [],
        }

        signature = {
            "digital_signature_present": False,
            "digital_signatures": [],
        }

        tamper = {
            "tampered": False,
            "reasons": [],
        }

        ownership = {
            "owner": "",
            "creator": "",
            "producer": "",
            "company": "",
        }

        access = AccessService.evaluate(
            risk["risk_level"]
        )

        if extension == "pdf":

            watermark = WatermarkService.detect(
                temp_path
            )

            signature = SignatureService.verify(
                temp_path
            )

            tamper = TamperService.analyze(
                temp_path
            )

        if extension == "pdf":
            ownership = OwnershipService.analyze(temp_path)

        pii_summary = " ".join(
            "%s:%d" % (k, len(v))
            for k, v in result.items()
            if isinstance(v, list) and v
        ) or "none"

        AuditService.log(
            db,
            current_user,
            "PII_DETECTED",
            "Detected PII in '%s' (%s); risk=%s(%s); classification=%s"
            % (
                file.filename,
                pii_summary,
                risk["risk_level"],
                risk["risk_score"],
                classification,
            ),
        )

        # Find the document that was uploaded by the current user
        document = (
            db.query(Document)
            .filter(
                Document.file_type == extension,
                Document.uploaded_by == current_user,
            )
            .order_by(Document.uploaded_at.desc())
            .first()
        )

        # If document is not found, create a record
        if document is None:

            document = Document(
                filename=file.filename,
                filepath=f"uploads/{file.filename}",
                file_type=extension,
                uploaded_by=current_user,
            )

            db.add(document)
            db.commit()
            db.refresh(document)

        # Update document analysis information
        document.classification = classification

        document.risk_level = risk["risk_level"]

        document.watermark_detected = bool(
            watermark["watermark_detected"]
        )

        document.tampered = bool(
            tamper["tampered"]
        )

        db.commit()
        db.refresh(document)

        # Create scan result
        scan = ScanResult(
            document_id=document.id,
            extracted_text=extracted_text,
            risk_score=risk["risk_score"],
            risk_level=risk["risk_level"],
        )

        db.add(scan)
        db.commit()
        db.refresh(scan)

        # Store each detected PII item
        for pii_type, values in result.items():

            if isinstance(values, list):

                for value in values:

                    detection = PIIDetection(
                        scan_id=scan.id,
                        pii_type=pii_type,
                        detected_value=str(value),
                        confidence=1.0,
                    )

                    db.add(detection)

        db.commit()

        return {
            **result,
            "highlights": highlights,
            "highlighted_file": f"/uploads/highlighted/{Path(highlighted_path).name}",
            "keywords": keywords,
            "risk_score": risk["risk_score"],
            "risk_level": risk["risk_level"],
            "risk_breakdown": risk["risk_breakdown"],
            "classification": classification,
            "edm_matches": edm_matches,
            "watermark_detected": watermark["watermark_detected"],
            "watermark_details": watermark["watermark_details"],
            "is_password_protected": pdf_security["is_password_protected"],
            "needs_password": pdf_security["needs_password"],
            "is_encrypted": pdf_security["is_encrypted"],
            "digital_signature_present": signature["digital_signature_present"],
            "digital_signatures": signature["digital_signatures"],
            "tampered": tamper["tampered"],
            "tamper_reasons": tamper["reasons"],
            "owner": ownership["owner"],
            "creator": ownership["creator"],
            "producer": ownership["producer"],
            "company": ownership["company"],
            "access_allowed": access["access_allowed"],
            "access_reason": access["reason"],
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    finally:

        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@router.post("/redact")
def redact_document(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
):

    extension = file.filename.split(".")[-1].lower()

    if extension not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type",
        )

    temp_path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=f".{extension}",
        ) as temp:

            temp.write(file.file.read())
            temp_path = temp.name

        if extension == "pdf":

            extracted_text = extract_text_from_pdf(temp_path)
            ocr_data = extract_pdf_data(temp_path)

        else:

            extracted_text = extract_text_from_image(temp_path)
            ocr_data = extract_image_data(temp_path)

        result = PIIDetector.detect(extracted_text)

        if extension == "pdf":

            redacted_path = RedactionService.redact_pdf(
                temp_path,
                result,
                ocr_data,
            )

        else:

            redacted_path = RedactionService.redact_image(
                temp_path,
                result,
                ocr_data,
            )

        return {
            "message": "Document redacted successfully",
            "redacted_file": f"/uploads/redacted/{Path(redacted_path).name}",
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    finally:

        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@router.post("/blur")
def blur_document(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
):

    extension = file.filename.split(".")[-1].lower()

    if extension not in ALLOWED_TYPES:

        raise HTTPException(
            status_code=400,
            detail="Unsupported file type",
        )

    temp_path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=f".{extension}",
        ) as temp:

            temp.write(file.file.read())
            temp_path = temp.name

        if extension == "pdf":

            extracted_text = extract_text_from_pdf(temp_path)
            ocr_data = extract_pdf_data(temp_path)

        else:

            extracted_text = extract_text_from_image(temp_path)
            ocr_data = extract_image_data(temp_path)

        result = PIIDetector.detect(extracted_text)

        blurred_path = BlurService.blur(
            temp_path,
            result,
            ocr_data,
        )

        return {
            "message": "Document blurred successfully",
            "blurred_file": f"/uploads/blurred/{Path(blurred_path).name}",
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    finally:

        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)