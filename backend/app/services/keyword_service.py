import os


class KeywordService:

    KEYWORD_FILE = "app/data/sensitive_keywords.txt"

    @staticmethod
    def load_keyword_categories():
        """Returns { category_name: [keyword, keyword, ...] } read from the # headers in the file."""

        categories = {}
        current_category = "General"

        if not os.path.exists(KeywordService.KEYWORD_FILE):
            return categories

        with open(KeywordService.KEYWORD_FILE, "r", encoding="utf-8") as file:

            for raw_line in file:
                line = raw_line.strip()

                if not line:
                    continue

                if line.startswith("#"):
                    current_category = line.lstrip("#").strip()
                    categories.setdefault(current_category, [])
                    continue

                categories.setdefault(current_category, []).append(line.lower())

        return categories

    @staticmethod
    def load_keywords():
        """Backward-compatible flat list of every keyword phrase, no category info."""

        categories = KeywordService.load_keyword_categories()
        flat = []

        for keywords in categories.values():
            flat.extend(keywords)

        return flat

    @staticmethod
    def detect(text: str):
        """Unchanged behaviour: flat list of matched raw phrases."""

        keywords = KeywordService.load_keywords()
        text_lower = text.lower()

        return [keyword for keyword in keywords if keyword in text_lower]

    @staticmethod
    def detect_categories(text: str):
        """NEW: list of category names that had at least one keyword match,
        e.g. ['Financial Reports', 'Vendor Contracts']."""

        categories = KeywordService.load_keyword_categories()
        text_lower = text.lower()

        return [
            category
            for category, keywords in categories.items()
            if any(keyword in text_lower for keyword in keywords)
        ]