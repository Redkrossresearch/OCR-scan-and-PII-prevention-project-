import fitz


class TamperService:

    @staticmethod
    def analyze(pdf_path: str):

        document = fitz.open(pdf_path)

        metadata = document.metadata

        suspicious = False

        reasons = []

        producer = metadata.get("producer", "")

        creator = metadata.get("creator", "")

        if producer and creator:

            if producer != creator:

                suspicious = True

                reasons.append(
                    "Creator and Producer differ"
                )

        result = {
            "tampered": suspicious,
            "reasons": reasons,
        }

        document.close()

        return result