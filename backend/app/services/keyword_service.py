import os


class KeywordService:

    KEYWORD_FILE = "app/data/sensitive_keywords.txt"

    @staticmethod
    def load_keywords():

        if not os.path.exists(KeywordService.KEYWORD_FILE):
            return []

        with open(
            KeywordService.KEYWORD_FILE,
            "r",
            encoding="utf-8",
        ) as file:

            return [
                line.strip().lower()
                for line in file
                if line.strip() and not line.strip().startswith("#")
            ]

    @staticmethod
    def detect(text: str):

        keywords = KeywordService.load_keywords()

        text_lower = text.lower()

        found = []

        for keyword in keywords:

            if keyword in text_lower:
                found.append(keyword)

        return found