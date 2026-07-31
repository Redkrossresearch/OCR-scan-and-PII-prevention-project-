from difflib import SequenceMatcher


class MatchingService:

    @staticmethod
    def is_match(a: str, b: str) -> bool:
        """
        Returns True if OCR text closely matches
        detected sensitive data.
        """

        a = a.strip().lower()
        b = b.strip().lower()

        if a == b:
            return True

        similarity = SequenceMatcher(
            None,
            a,
            b,
        ).ratio()

        return similarity >= 0.90