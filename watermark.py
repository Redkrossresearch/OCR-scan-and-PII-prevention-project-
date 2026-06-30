import cv2
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

class WatermarkDetector:

    def scan(self, image_path):

        image = cv2.imread(image_path)

        if image is None:
            return {
                "success": False,
                "message": f"Cannot read image: {image_path}"
            }

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        text = pytesseract.image_to_string(gray)

        return {
            "success": True,
            "ocr_text": text
        }