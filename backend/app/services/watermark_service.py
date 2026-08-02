import fitz  # PyMuPDF


class WatermarkService:

    KEYWORDS = ["confidential", "draft", "sample", "copy", "watermark"]

    @staticmethod
    def _keyword_check(document):
        """
        Original heuristic: look for common watermark-related words
        anywhere in the extracted text.
        """
        for page in document:
            text = page.get_text().lower()
            for keyword in WatermarkService.KEYWORDS:
                if keyword in text:
                    return True, f"Watermark-related keyword '{keyword}' found in document text"
        return False, None

    @staticmethod
    def _repeated_image_check(document):
        """
        A single image repeated across most/all pages (same internal
        object reference) is a strong signal of a stamped watermark
        image, as opposed to normal photos/figures which are usually
        unique per page.
        """
        total_pages = len(document)

        if total_pages < 2:
            return False, None

        image_page_counts = {}

        for page in document:
            seen_on_this_page = set()
            for img in page.get_images(full=True):
                xref = img[0]
                if xref not in seen_on_this_page:
                    seen_on_this_page.add(xref)
                    image_page_counts[xref] = image_page_counts.get(xref, 0) + 1

        for xref, count in image_page_counts.items():
            if count >= max(2, total_pages // 2):
                return True, (
                    f"The same embedded image repeats on {count} of "
                    f"{total_pages} pages, consistent with a stamped "
                    f"watermark image"
                )

        return False, None

    @staticmethod
    def _rotated_text_check(document):
        """
        Diagonal or otherwise non-horizontal text (e.g. text rotated ~45
        degrees across the page) is a classic visual watermark pattern
        that plain keyword matching would miss entirely.
        """
        for page_number, page in enumerate(document, start=1):
            try:
                text_dict = page.get_text("dict")
            except Exception:
                continue

            for block in text_dict.get("blocks", []):
                for line in block.get("lines", []):
                    dx, dy = line.get("dir", (1.0, 0.0))

                    # A horizontal line has dy close to 0. Anything
                    # noticeably tilted (diagonal/vertical) is flagged.
                    if abs(dy) > 0.3:
                        line_text = "".join(
                            span.get("text", "") for span in line.get("spans", [])
                        ).strip()

                        if len(line_text) >= 3:
                            return True, (
                                f"Diagonal/rotated text '{line_text[:40]}' found "
                                f"on page {page_number}, consistent with an "
                                f"overlay watermark"
                            )

        return False, None

    @staticmethod
    def detect(pdf_path: str):
        document = fitz.open(pdf_path)

        details = []
        detected = False

        for check in (
            WatermarkService._keyword_check,
            WatermarkService._repeated_image_check,
            WatermarkService._rotated_text_check,
        ):
            found, reason = check(document)
            if found:
                detected = True
                details.append(reason)

        document.close()

        return {
            "watermark_detected": detected,
            "watermark_details": details,
        }