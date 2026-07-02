import fitz


class OwnershipService:

    @staticmethod
    def analyze(pdf_path: str):

        document = fitz.open(pdf_path)

        metadata = document.metadata

        owner = metadata.get("author", "")

        creator = metadata.get("creator", "")

        producer = metadata.get("producer", "")

        company = metadata.get("subject", "")

        document.close()

        return {
            "owner": owner,
            "creator": creator,
            "producer": producer,
            "company": company,
        }