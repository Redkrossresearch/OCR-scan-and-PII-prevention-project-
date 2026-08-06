import re
from difflib import SequenceMatcher


class MatchingService:

    @staticmethod
    def normalize(s: str) -> str:
        return re.sub(r"[\s\-]", "", s).strip().lower()

    @staticmethod
    def is_match(a: str, b: str) -> bool:
        a_l = a.strip().lower()
        b_l = b.strip().lower()

        if a_l == b_l:
            return True

        if MatchingService.normalize(a) == MatchingService.normalize(b):
            return True

        similarity = SequenceMatcher(None, a_l, b_l).ratio()
        return similarity >= 0.90