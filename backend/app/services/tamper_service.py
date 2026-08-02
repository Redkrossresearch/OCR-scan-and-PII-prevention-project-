from datetime import datetime

import fitz  # PyMuPDF


class TamperService:

    @staticmethod
    def _parse_pdf_date(date_str):
        """
        PDF metadata dates look like: D:20240115120000+05'30'
        This pulls out just the YYYYMMDDHHMMSS part.
        """
        if not date_str:
            return None

        value = date_str
        if value.startswith("D:"):
            value = value[2:]

        for length, fmt in ((14, "%Y%m%d%H%M%S"), (8, "%Y%m%d")):
            try:
                return datetime.strptime(value[:length], fmt)
            except (ValueError, TypeError):
                continue

        return None

    @staticmethod
    def _metadata_mismatch_check(metadata):
        """
        Original heuristic: Producer and Creator fields disagreeing can
        indicate the file was re-saved with a different tool than the
        one that created it. Kept as one signal among several, since on
        its own this has a meaningful false-positive rate.
        """
        producer = metadata.get("producer", "")
        creator = metadata.get("creator", "")

        if producer and creator and producer != creator:
            return (
                f"Creator ('{creator}') and Producer ('{producer}') differ - "
                f"the file may have been edited or re-saved with a "
                f"different tool than the one that created it"
            )
        return None

    @staticmethod
    def _date_mismatch_check(metadata):
        """
        If the document's last-modified timestamp is meaningfully after
        its creation timestamp, the file was edited after it was first
        produced.
        """
        created = TamperService._parse_pdf_date(metadata.get("creationDate"))
        modified = TamperService._parse_pdf_date(metadata.get("modDate"))

        if created and modified:
            delta = modified - created
            if delta.total_seconds() > 60:
                return (
                    f"Document was modified {delta} after it was created "
                    f"(created: {created}, modified: {modified})"
                )
        return None

    @staticmethod
    def _incremental_update_check(pdf_path):
        """
        PDFs support 'incremental saves', where edits are appended to
        the end of the file rather than rewriting it. Each incremental
        save leaves behind its own '%%EOF' marker, so more than one in
        the raw file is a strong sign the document was edited after its
        original save.
        """
        try:
            with open(pdf_path, "rb") as f:
                raw = f.read()
        except OSError:
            return None

        eof_count = raw.count(b"%%EOF")

        if eof_count > 1:
            return (
                f"File contains {eof_count} '%%EOF' markers, indicating it "
                f"was incrementally saved/edited multiple times after its "
                f"original creation"
            )
        return None

    @staticmethod
    def analyze(pdf_path: str):
        document = fitz.open(pdf_path)
        metadata = document.metadata
        document.close()

        reasons = []

        for reason in (
            TamperService._metadata_mismatch_check(metadata),
            TamperService._date_mismatch_check(metadata),
            TamperService._incremental_update_check(pdf_path),
        ):
            if reason:
                reasons.append(reason)

        return {
            "tampered": len(reasons) > 0,
            "reasons": reasons,
        }