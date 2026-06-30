from pypdf import PdfReader

class DigitalSignatureVerifier:

    def verify(self, pdf_path):
        try:
            reader = PdfReader(pdf_path)

            signatures = []

            if "/AcroForm" in reader.trailer["/Root"]:
                form = reader.trailer["/Root"]["/AcroForm"]

                if "/Fields" in form:
                    for field in form["/Fields"]:
                        obj = field.get_object()

                        if obj.get("/FT") == "/Sig":
                            signatures.append({
                                "field_name": obj.get("/T", "Unknown"),
                                "status": "Signature Found"
                            })

            return {
                "success": True,
                "signed": len(signatures) > 0,
                "signature_count": len(signatures),
                "signatures": signatures
            }

        except Exception as e:
            return {
                "success": False,
                "message": str(e)
            }