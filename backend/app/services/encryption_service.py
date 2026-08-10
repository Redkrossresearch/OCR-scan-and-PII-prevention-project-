import os
import re
import secrets
from datetime import datetime

import fitz  # PyMuPDF
from PIL import Image

OUTPUT_DIR = "uploads/protected"
os.makedirs(OUTPUT_DIR, exist_ok=True)


class EncryptionService:

    HIGH_RISK_LEVELS = {"HIGH", "CRITICAL"}

    # Roles allowed to actually see the password. Kept in one place so it's
    # easy to extend later without touching the encryption logic itself.
    AUTHORIZED_ROLES = {"admin", "manager", "hr", "compliance officer"}

    # Human-readable description of the password formula, shown to everyone
    # (authorized or not) so a document + password can be shared like an
    # Aadhaar-style PDF: the password isn't secret in itself, it's derivable
    # from info already on the document (uploader + upload year).
    PASSWORD_HINT = "First 4 letters of the uploader's name (CAPS) + the upload year"

    @staticmethod
    def should_encrypt(risk_level: str) -> bool:
        return str(risk_level or "").upper() in EncryptionService.HIGH_RISK_LEVELS

    @staticmethod
    def generate_password(uploaded_by: str) -> str:
        # uploaded_by may be an email ("lochanapatil@gmail.com") — use the
        # part before "@" as the "name" if it looks like an email.
        raw_name = str(uploaded_by or "").split("@")[0]
        letters_only = re.sub(r"[^A-Za-z]", "", raw_name)
        name_part = (letters_only[:4] or "USER").upper().ljust(4, "X")
        year_part = str(datetime.now().year)
        return f"{name_part}{year_part}"

    @staticmethod
    def _image_to_pdf_bytes(image_path: str) -> bytes:
        with Image.open(image_path) as img:
            img = img.convert("RGB")
            temp_img_path = image_path + "_for_pdf.png"
            img.save(temp_img_path)

        pdf_doc = fitz.open()
        with Image.open(temp_img_path) as img:
            rect = fitz.Rect(0, 0, img.width, img.height)
            page = pdf_doc.new_page(width=img.width, height=img.height)
            page.insert_image(rect, filename=temp_img_path)

        pdf_bytes = pdf_doc.tobytes()
        pdf_doc.close()

        if os.path.exists(temp_img_path):
            os.remove(temp_img_path)

        return pdf_bytes

    @staticmethod
    def protect_file(file_path: str, extension: str, user_role: str, uploaded_by: str = ""):

        extension = extension.lower().lstrip(".")

        if extension == "pdf":
            src_doc = fitz.open(file_path)
        else:
            pdf_bytes = EncryptionService._image_to_pdf_bytes(file_path)
            src_doc = fitz.open("pdf", pdf_bytes)

        password = EncryptionService.generate_password(uploaded_by)
        owner_password = secrets.token_urlsafe(8)

        filename = os.path.splitext(os.path.basename(file_path))[0] + "_protected.pdf"
        output_path = os.path.join(OUTPUT_DIR, filename)

        src_doc.save(
            output_path,
            encryption=fitz.PDF_ENCRYPT_AES_256,
            user_pw=password,
            owner_pw=owner_password,
            permissions=fitz.PDF_PERM_PRINT | fitz.PDF_PERM_COPY,
        )
        src_doc.close()

        is_authorized = str(user_role or "").strip().lower() in EncryptionService.AUTHORIZED_ROLES

        return {
            "encrypted": True,
            "output_path": output_path,
            "password": password if is_authorized else None,
            "hint": EncryptionService.PASSWORD_HINT if is_authorized else None,
            "authorized": is_authorized,
            "message": (
                "Document encrypted — password shown because your role is authorized."
                if is_authorized
                else "Document encrypted. Your role does not have permission to view the "
                     "password — contact an authorized user (Admin/Manager/HR) for access."
            ),
        }