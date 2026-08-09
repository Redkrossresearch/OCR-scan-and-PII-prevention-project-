import os
import tempfile

import fitz
import cv2
import zxingcpp


class QRBarcodeService:

    @staticmethod
    def decode_image(image_path: str):
        """
        Detect and decode QR codes and barcodes
        using ZXing-C++.
        """

        if not os.path.exists(image_path):
            raise FileNotFoundError(
                f"Image not found: {image_path}"
            )

        results = []

        try:
            image = cv2.imread(image_path)

            if image is None:
                raise ValueError(
                    "Unable to read image"
                )

            decoded_objects = (
                zxingcpp.read_barcodes(image)
            )

            for obj in decoded_objects:

                data = obj.text

                if not data:
                    continue

                barcode_type = str(obj.format)

                results.append({
                    "type": barcode_type,
                    "data": data
                })

        except Exception as e:

            raise Exception(
                f"QR/Barcode decoding failed: {str(e)}"
            )

        return results

    @staticmethod
    def decode_pdf(pdf_path: str):
        """
        Detect QR codes and barcodes on
        every page of a PDF.
        """

        if not os.path.exists(pdf_path):
            raise FileNotFoundError(
                f"PDF not found: {pdf_path}"
            )

        results = []
        document = None

        try:

            document = fitz.open(pdf_path)

            for page_number in range(len(document)):
                page = document[page_number]

                # Render PDF at 300 DPI
                pixmap = page.get_pixmap(
                    dpi=300
                )

                with tempfile.NamedTemporaryFile(
                    suffix=".png",
                    delete=False
                ) as temp:

                    temp_path = temp.name

                try:

                    pixmap.save(temp_path)

                    page_results = (
                        QRBarcodeService.decode_image(
                            temp_path
                        )
                    )

                    for result in page_results:

                        result["page"] = (
                            page_number + 1
                        )

                        results.append(result)

                finally:

                    if os.path.exists(temp_path):
                        os.remove(temp_path)

        except Exception as e:

            raise Exception(
                f"QR/Barcode PDF decoding failed: "
                f"{str(e)}"
            )

        finally:

            if document:
                document.close()

        return results

    @staticmethod
    def extract(
        file_path: str,
        extension: str
    ):
        """
        Automatically process PDF or image.
        """

        extension = extension.lower().lstrip(".")

        if extension == "pdf":

            return QRBarcodeService.decode_pdf(
                file_path
            )

        return QRBarcodeService.decode_image(
            file_path
        )