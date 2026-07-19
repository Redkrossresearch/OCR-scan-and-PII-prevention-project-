from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import pytesseract
import fitz  # PyMuPDF
import io

router = APIRouter(
    prefix="/watermark",
    tags=["Watermark Detection"]
)

# Uncomment and change the path if Tesseract is not in PATH
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

WATERMARK_KEYWORDS = [
    "CONFIDENTIAL",
    "SECRET",
    "PRIVATE",
    "INTERNAL",
    "TOP SECRET",
    "CLASSIFIED"
]


def check_watermark(text):
    text = text.upper()
    detected = [k for k in WATERMARK_KEYWORDS if k in text]

    return {
        "watermark_detected": len(detected) > 0,
        "detected_keywords": detected,
        "ocr_text": text
    }


@router.post("/detect")
async def detect_watermark(file: UploadFile = File(...)):
    try:
        filename = file.filename.lower()
        contents = await file.read()

        # ---------------- IMAGE ----------------
        if filename.endswith((".png", ".jpg", ".jpeg", ".bmp")):

            image = Image.open(io.BytesIO(contents))
            text = pytesseract.image_to_string(image)

            result = check_watermark(text)
            result["filename"] = file.filename
            result["file_type"] = "Image"

            return result

        # ---------------- PDF ----------------
        elif filename.endswith(".pdf"):

            pdf = fitz.open(stream=contents, filetype="pdf")

            extracted_text = ""

            for page in pdf:

                pix = page.get_pixmap(dpi=300)

                img = Image.open(
                    io.BytesIO(pix.tobytes("png"))
                )

                extracted_text += pytesseract.image_to_string(img)

            result = check_watermark(extracted_text)
            result["filename"] = file.filename
            result["file_type"] = "PDF"

            return result

        else:
            raise HTTPException(
                status_code=400,
                detail="Only Image and PDF files are supported."
            )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )