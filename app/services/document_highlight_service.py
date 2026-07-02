import os

from PIL import Image, ImageDraw

from app.services.region_service import RegionService

OUTPUT_DIR = "uploads/highlighted"

os.makedirs(OUTPUT_DIR, exist_ok=True)


class DocumentHighlightService:

    @staticmethod
    def highlight(
        file_path: str,
        pii_result: dict,
        ocr_data: list,
    ) -> str:

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
                outline="red",
                width=3,
            )

        filename = os.path.basename(file_path)

        output_path = os.path.join(
            OUTPUT_DIR,
            filename,
        )

        image.save(output_path)

        return output_path