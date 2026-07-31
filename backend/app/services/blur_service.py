import os

from PIL import Image, ImageFilter

from app.services.region_service import RegionService

OUTPUT_DIR = "uploads/blurred"

os.makedirs(OUTPUT_DIR, exist_ok=True)


class BlurService:

    @staticmethod
    def blur(
        file_path: str,
        pii_result: dict,
        ocr_data: list,
    ) -> str:

        image = Image.open(file_path)

        regions = RegionService.build_regions(
            pii_result,
            ocr_data,
        )

        for region in regions:

            x = region["left"]
            y = region["top"]
            w = region["width"]
            h = region["height"]

            cropped = image.crop(
                (
                    x,
                    y,
                    x + w,
                    y + h,
                )
            )

            blurred = cropped.filter(
                ImageFilter.GaussianBlur(radius=12)
            )

            image.paste(
                blurred,
                (
                    x,
                    y,
                ),
            )

        filename = os.path.basename(file_path)

        output_path = os.path.join(
            OUTPUT_DIR,
            filename,
        )

        image.save(output_path)

        return output_path