from fastapi import APIRouter, UploadFile, File, HTTPException
import fitz
from PIL import Image
import pytesseract

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

import io

router = APIRouter(
    prefix="/signature",
    tags=["Digital Signature Verification"]
)

# Uncomment if Tesseract is not in PATH
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

SIGNATURE_KEYWORDS = [
    "DIGITALLY SIGNED",
    "SIGNED",
    "AUTHORIZED SIGNATORY",
    "E-SIGN",
    "SIGNATURE"
]


@router.post("/verify")
async def verify_signature(file: UploadFile = File(...)):
    try:
        filename = file.filename.lower()
        contents = await file.read()

        # ---------------- PDF ----------------
        if filename.endswith(".pdf"):

            doc = fitz.open(stream=contents, filetype="pdf")

            signature_found = False

            for page in doc:
                widgets = page.widgets()
                if widgets:
                    for widget in widgets:
                        if widget.field_type == fitz.PDF_WIDGET_TYPE_SIGNATURE:
                            signature_found = True
                            break
                if signature_found:
                    break

            return {
                "filename": file.filename,
                "file_type": "PDF",
                "digitally_signed": signature_found,
                "message": "Digital signature found." if signature_found else "No digital signature found."
            }

        # ---------------- IMAGE ----------------
        elif filename.endswith((".png", ".jpg", ".jpeg", ".bmp")):

            image = Image.open(io.BytesIO(contents))

            text = pytesseract.image_to_string(image).upper()

            detected = [k for k in SIGNATURE_KEYWORDS if k in text]

            return {
                "filename": file.filename,
                "file_type": "Image",
                "digitally_signed": len(detected) > 0,
                "detected_keywords": detected,
                "ocr_text": text
            }

        else:
            raise HTTPException(
                status_code=400,
                detail="Only PDF and Image files are supported."
            )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )