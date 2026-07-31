import os
import fitz
from PIL import Image, ImageDraw

from app.services.region_service import RegionService

OUTPUT_DIR = "uploads/redacted"

os.makedirs(OUTPUT_DIR, exist_ok=True)


class RedactionService:

    @staticmethod
    def redact_image(
        file_path: str,
        pii_result: dict,
        ocr_data: list,
    ):

        image = Image.open(file_path)

        draw = ImageDraw.Draw(image)

        regions = RegionService.build_regions(
            pii_result,
            ocr_data,
        )

        for region in regions:

            x = region["left"]
            y = region["top"]
            w = region["width"]
            h = region["height"]

            draw.rectangle(
                [(x, y), (x + w, y + h)],
                fill="black",
            )

        filename = os.path.basename(file_path)

        output_path = os.path.join(
            OUTPUT_DIR,
            filename,
        )

        image.save(output_path)

        return output_path

    @staticmethod
    def redact_pdf(
        file_path: str,
        pii_result: dict,
    ):

        filename = os.path.basename(file_path)

        output_path = os.path.join(
            OUTPUT_DIR,
            filename,
        )

        document = fitz.open(file_path)

        sensitive_values = set()

        for values in pii_result.values():
            sensitive_values.update(values)

        for page in document:

            words = page.get_text("words")

            for word in words:

                text = str(word[4]).strip()

                if text in sensitive_values:

                    rect = fitz.Rect(
                        word[0],
                        word[1],
                        word[2],
                        word[3],
                    )

                    page.add_redact_annot(
                        rect,
                        fill=(0, 0, 0),
                    )

            page.apply_redactions()

        document.save(output_path)
        document.close()

        return output_path