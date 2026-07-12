import re


class ClipboardService:


    @staticmethod
    def check_clipboard(data):

        content = data["content"]

        sensitive_patterns = {

            "Aadhaar": r"\b\d{12}\b",

            "PAN": r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",

            "Credit Card": r"\b\d{16}\b",

            "Email": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
        }


        detected = []


        for name, pattern in sensitive_patterns.items():

            if re.search(pattern, content):
                detected.append(name)


        if detected:

            return {

                "blocked": True,

                "reason": 
                f"Clipboard blocked. Sensitive data detected: {', '.join(detected)}"

            }


        return {

            "blocked": False,

            "reason": "Clipboard content is safe"

        }