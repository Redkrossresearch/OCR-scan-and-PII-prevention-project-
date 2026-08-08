import re

# Configurable detection rules: name -> (category, severity, regex pattern)
# Add/remove entries here — no other code needs to change.
SENSITIVE_PATTERNS = {
    "Aadhaar":              ("pii", "high", r"\b\d{12}\b"),
    "PAN":                  ("pii", "high", r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"),
    "Credit Card":          ("pci", "high", r"\b\d{13,16}\b"),
    "Email":                ("pii", "low", r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
    "Phone Number":         ("pii", "low", r"\b\d{10}\b"),
    "AWS Access Key":       ("cloud_credentials", "critical", r"\bAKIA[0-9A-Z]{16}\b"),
    "Private Key":          ("cryptographic_key", "critical", r"-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
    "Generic API Key":      ("credentials", "high", r"(?i)(api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*[A-Za-z0-9\-_]{16,}"),
    "Password":             ("credentials", "high", r"(?i)(password|passwd|pwd)\s*[:=]\s*\S{4,}"),
    "DB Connection String": ("credentials", "high", r"(?i)(mongodb|postgres|mysql|jdbc)://[^\s]+"),
    "Confidential Marker":  ("company_confidential", "medium", r"(?i)\b(confidential|internal use only|do not distribute)\b"),
}

_SEVERITY_ORDER = {"low": 0, "medium": 1, "high": 2, "critical": 3}


class ClipboardService:

    @staticmethod
    def check_clipboard(data):
        content = data.get("content") or ""

        try:
            best = None  # (name, category, severity)
            for name, (category, severity, pattern) in SENSITIVE_PATTERNS.items():
                if re.search(pattern, content):
                    if best is None or _SEVERITY_ORDER[severity] > _SEVERITY_ORDER[best[2]]:
                        best = (name, category, severity)

            if best is None:
                return {
                    "blocked": False,
                    "reason": "Clipboard content is safe",
                    "category": None,
                    "severity": None,
                    "rule_name": None,
                }

            name, category, severity = best
            return {
                "blocked": True,
                "reason": f"Clipboard blocked. Sensitive data detected: {name}",
                "category": category,
                "severity": severity,
                "rule_name": name,
            }

        except Exception as exc:
            # Fail safe: if detection itself errors, block rather than
            # silently letting sensitive content through.
            return {
                "blocked": True,
                "reason": f"Detection engine failure, failing safe: {exc.__class__.__name__}",
                "category": "detection_engine_error",
                "severity": "critical",
                "rule_name": "fail_safe",
            }