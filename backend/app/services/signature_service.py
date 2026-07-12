import fitz


class SignatureService:

    @staticmethod
    def verify(pdf_path: str):

        document = fitz.open(pdf_path)

        signatures = []

        try:

            for page in document:

                widgets = page.widgets()

                if widgets:

                    for widget in widgets:

                        if widget.field_type == fitz.PDF_WIDGET_TYPE_SIGNATURE:

                            signatures.append(
                                {
                                    "field_name": widget.field_name,
                                    "signed": True,
                                }
                            )

        except Exception:
            pass

        document.close()

        return {
            "digital_signature_present": len(signatures) > 0,
            "digital_signatures": signatures,
        }