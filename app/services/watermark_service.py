import fitz


class WatermarkService:

    @staticmethod
    def detect(pdf_path: str):

        document = fitz.open(pdf_path)

        detected = False
        watermarks = []

        for page_no, page in enumerate(document):

            text = page.get_text().lower()

            keywords = [
                "confidential",
                "draft",
                "sample",
                "copy",
                "watermark",
            ]

            found = []

            for keyword in keywords:

                if keyword in text:
                    found.append(keyword)

            if found:

                detected = True

                watermarks.append(
                    {
                        "page": page_no + 1,
                        "keywords": found,
                    }
                )

        document.close()

        return {
            "watermark_detected": detected,
            "watermark_details": watermarks,
        }