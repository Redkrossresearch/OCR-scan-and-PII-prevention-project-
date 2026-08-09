import re


class PIIDetector:

    PATTERNS = {
        "emails": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",

        "phone_numbers": r"\b(?:\+91[- ]?)?[6-9]\d{9}\b",

        # Requires the conventional spaced grouping (1234 5678 9123) so a bare
        # 12-digit run (e.g. a bank account number) isn't also claimed as an Aadhaar.
        "aadhaar_numbers": r"\b\d{4}[ ]\d{4}[ ]\d{4}\b",

        "pan_numbers": r"\b[A-Za-z]{5}[0-9]{4}[A-Za-z]\b",

        "passport_numbers": r"\b[A-Za-z][0-9]{7}\b",

        "credit_cards": r"\b(?:4[0-9]{3}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{1,4}|5[1-5][0-9]{2}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}|3[47][0-9]{2}[- ]?[0-9]{6}[- ]?[0-9]{5}|3(?:0[0-5]|[68][0-9])[0-9][- ]?[0-9]{6}[- ]?[0-9]{4}|6(?:011|5[0-9]{2})[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4})\b",

        "ssn_numbers": r"\b\d{3}-\d{2}-\d{4}\b",

        "ifsc_codes": r"\b[A-Za-z]{4}0[A-Za-z0-9]{6}\b",

        "gstin_numbers": r"\b\d{2}[A-Za-z]{5}\d{4}[A-Za-z]{1}[1-9A-Za-z]{1}Z[0-9A-Za-z]{1}\b",

        "bank_account_numbers": r"\b\d{9,18}\b",
    }

    # Order in which patterns "claim" a span of text, most structured/specific
    # first. A later, looser pattern (e.g. bank_account_numbers) is skipped if
    # it would overlap a span already claimed by an earlier, more specific
    # pattern — this stops one real value being tagged under multiple
    # different PII types (e.g. a phone number also showing up as a bank
    # account number, or credit card digits being read as an Aadhaar number).
    PRIORITY = [
        "credit_cards",
        "gstin_numbers",
        "ifsc_codes",
        "pan_numbers",
        "passport_numbers",
        "emails",
        "ssn_numbers",
        "aadhaar_numbers",
        "phone_numbers",
        "bank_account_numbers",
    ]

    @staticmethod
    def detect(text: str):

        results = {key: [] for key in PIIDetector.PATTERNS}
        claimed_spans = []

        def overlaps_claimed(span):
            start, end = span
            for claimed_start, claimed_end in claimed_spans:
                if start < claimed_end and end > claimed_start:
                    return True
            return False

        for key in PIIDetector.PRIORITY:

            pattern = PIIDetector.PATTERNS[key]

            for match in re.finditer(pattern, text, flags=re.IGNORECASE):

                span = match.span()

                if overlaps_claimed(span):
                    continue

                results[key].append(match.group())
                claimed_spans.append(span)

        return results