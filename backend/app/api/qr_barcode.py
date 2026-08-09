import os
import tempfile

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends,
)
from sqlalchemy.orm import Session

from app.services.qr_barcode_service import (
    QRBarcodeService
)

from app.services.pii_service import (
    PIIDetector
)

from app.services.risk_service import (
    RiskService
)

from app.core.dependencies import (
    get_current_user
)

from app.database.database import get_db

from app.services.audit_service import (
    AuditService
)


router = APIRouter(
    prefix="/qr-barcode",
    tags=["QR Code / Barcode"]
)


ALLOWED_TYPES = [
    "pdf",
    "png",
    "jpg",
    "jpeg",
]


@router.post("/extract")
def extract_qr_barcode(
    file: UploadFile = File(...),
    current_user: str = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    filename = file.filename or ""
    extension = (
        filename.rsplit(".", 1)[-1].lower()
        if "." in filename
        else ""
    )

    if extension not in ALLOWED_TYPES:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Allowed: PDF, PNG, JPG, JPEG"
            ),
        )

    temp_path = None

    try:

        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=f".{extension}"
        ) as temp:

            temp.write(
                file.file.read()
            )

            temp_path = temp.name

        # Detect and decode QR/barcodes
        decoded_results = (
            QRBarcodeService.extract(
                temp_path,
                extension
            )
        )

        final_results = []

        total_pii = {
            key: []
            for key in PIIDetector.PATTERNS
        }

        for item in decoded_results:

            decoded_text = item["data"]

            # Run decoded QR/barcode data
            # through EXISTING PII detector
            pii_result = PIIDetector.detect(
                decoded_text
            )

            # Calculate risk using EXISTING
            # RiskService
            risk = RiskService.calculate(
                pii_result
            )

            # Add PII information to result
            item["pii_detected"] = pii_result

            item["risk_score"] = (
                risk["risk_score"]
            )

            item["risk_level"] = (
                risk["risk_level"]
            )

            item["risk_breakdown"] = (
                risk["risk_breakdown"]
            )

            # Combine PII results
            for pii_type, values in pii_result.items():

                if isinstance(values, list):

                    total_pii[pii_type].extend(
                        values
                    )

            final_results.append(item)

        # Audit logging
        AuditService.log(
            db,
            current_user,
            "QR_BARCODE_SCAN",
            (
                "Scanned '%s'; detected %d "
                "QR/barcode codes"
            )
            % (
                file.filename,
                len(final_results)
            ),
        )

        return {
            "success": True,
            "filename": file.filename,
            "codes_detected": len(
                final_results
            ),
            "results": final_results,
            "pii_summary": total_pii,
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    finally:

        if (
            temp_path
            and os.path.exists(temp_path)
        ):

            os.remove(temp_path)