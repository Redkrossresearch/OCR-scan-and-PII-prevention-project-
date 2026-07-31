import fitz


class PDFSecurityService:

    @staticmethod
    def analyze(pdf_path: str):

        document = fitz.open(pdf_path)

        result = {
            "is_password_protected": False,
            "needs_password": False,
            "is_encrypted": False,
        }

        if document.needs_pass:
            result["is_password_protected"] = True
            result["needs_password"] = True

        if document.is_encrypted:
            result["is_encrypted"] = True

        document.close()

        return result