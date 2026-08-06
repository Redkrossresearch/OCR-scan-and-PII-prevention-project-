import os
import tempfile

import fitz  # PyMuPDF
import pytesseract
from PIL import Image

# Windows Tesseract Installation Path
pytesseract.pytesseract.tesseract_cmd = "tesseract"


def extract_text_from_image(image_path: str) -> str:
    """
    Extract text from an image using Tesseract OCR.
    """

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    try:
        with Image.open(image_path) as image:
            text = pytesseract.image_to_string(image)

        return text.strip()

    except Exception as e:
        raise Exception(f"OCR failed: {str(e)}")


def extract_image_data(image_path: str):
    """
    Extract OCR text along with bounding boxes.

    Returns:
    [
        {
            "text": "...",
            "left": ...,
            "top": ...,
            "width": ...,
            "height": ...
        }
    ]
    """

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    with Image.open(image_path) as image:
        data = pytesseract.image_to_data(
            image,
            output_type=pytesseract.Output.DICT
        )

    results = []

    n = len(data["text"])

    for i in range(n):

        text = data["text"][i].strip()

        if text == "":
            continue

        results.append(
            {
                "text": text,
                "left": data["left"][i],
                "top": data["top"][i],
                "width": data["width"][i],
                "height": data["height"][i],
            }
        )

    return results


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from PDF.

    1. Extract embedded text if available.
    2. OCR scanned pages.
    """

    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    extracted_text = ""

    try:

        document = fitz.open(pdf_path)

        for page in document:

            text = page.get_text()

            if text.strip():
                extracted_text += text + "\n"
                continue

            pix = page.get_pixmap(dpi=300)

            with tempfile.NamedTemporaryFile(
                suffix=".png",
                delete=False,
            ) as temp:

                temp_path = temp.name

            try:

                pix.save(temp_path)

                with Image.open(temp_path) as image:
                    extracted_text += (
                        pytesseract.image_to_string(image) + "\n"
                    )

            finally:

                if os.path.exists(temp_path):
                    os.remove(temp_path)

        document.close()

        return extracted_text.strip()

    except Exception as e:
        raise Exception(f"PDF OCR failed: {str(e)}")


def extract_pdf_data(pdf_path: str):
    """
    Extract OCR bounding boxes from scanned PDF pages.
    """

    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    all_data = []

    document = fitz.open(pdf_path)

    try:

        for page_number, page in enumerate(document):

            pix = page.get_pixmap(dpi=300)

            with tempfile.NamedTemporaryFile(
                suffix=".png",
                delete=False,
            ) as temp:

                temp_path = temp.name

            try:

                pix.save(temp_path)

                page_data = extract_image_data(temp_path)

                for item in page_data:
                    item["page"] = page_number

                all_data.extend(page_data)

            finally:

                if os.path.exists(temp_path):
                    os.remove(temp_path)

    finally:

        document.close()

    return all_data