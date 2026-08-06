import os
from io import BytesIO

import fitz
from PIL import Image, ImageFilter

from app.services.region_service import RegionService

OUTPUT_DIR = "uploads/blurred"
os.makedirs(OUTPUT_DIR, exist_ok=True)


class BlurService:

    @staticmethod
    def blur(file_path, pii_result, ocr_data):
        extension = file_path.split(".")[-1].lower()
        filename = os.path.basename(file_path)
        output_path = os.path.join(OUTPUT_DIR, filename)

        if extension == "pdf":
            return BlurService._blur_pdf(file_path, pii_result, ocr_data, output_path)

        return BlurService._blur_image(file_path, pii_result, ocr_data, output_path)

    @staticmethod
    def _blur_image(file_path, pii_result, ocr_data, output_path):
        image = Image.open(file_path)
        regions = RegionService.build_regions(pii_result, ocr_data)

        for region in regions:
            x, y, w, h = region["left"], region["top"], region["width"], region["height"]
            cropped = image.crop((x, y, x + w, y + h))
            blurred = cropped.filter(ImageFilter.GaussianBlur(radius=12))
            image.paste(blurred, (x, y))

        image.save(output_path)
        return output_path

    @staticmethod
    def _blur_pdf(file_path, pii_result, ocr_data, output_path):
        document = fitz.open(file_path)

        sensitive_values = set()
        for values in pii_result.values():
            sensitive_values.update(values)

        SCALE = 72 / 300

        for page_number, page in enumerate(document):

            for value in sensitive_values:
                if not value:
                    continue

                matches = page.search_for(value)

                for rect in matches:
                    pix = page.get_pixmap(clip=rect, dpi=300)
                    img_bytes = pix.tobytes("png")
                    pil_image = Image.open(BytesIO(img_bytes))
                    blurred = pil_image.filter(ImageFilter.GaussianBlur(radius=8))
                    blurred_bytes = BytesIO()
                    blurred.save(blurred_bytes, format="PNG")
                    page.insert_image(rect, stream=blurred_bytes.getvalue())

            page_ocr_words = [w for w in ocr_data if w.get("page") == page_number]

            if page_ocr_words:
                regions = RegionService.build_regions(pii_result, page_ocr_words)

                for region in regions:
                    rect = fitz.Rect(
                        region["left"] * SCALE,
                        region["top"] * SCALE,
                        (region["left"] + region["width"]) * SCALE,
                        (region["top"] + region["height"]) * SCALE,
                    )
                    pix = page.get_pixmap(clip=rect, dpi=300)
                    img_bytes = pix.tobytes("png")
                    pil_image = Image.open(BytesIO(img_bytes))
                    blurred = pil_image.filter(ImageFilter.GaussianBlur(radius=8))
                    blurred_bytes = BytesIO()
                    blurred.save(blurred_bytes, format="PNG")
                    page.insert_image(rect, stream=blurred_bytes.getvalue())

        document.save(output_path)
        document.close()
        return output_path