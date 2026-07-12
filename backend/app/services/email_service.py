import re


class EmailService:


    @staticmethod
    def scan_email(data):

        content = data["content"]

        sensitive_found = False
        risk_level = "Low"

        patterns = {
            "email": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",

            "phone": r"\b\d{10}\b",

            "aadhaar": r"\b\d{12}\b",

            "pan": r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"
        }


        detected = []


        for key, pattern in patterns.items():

            if re.search(pattern, content):
                sensitive_found = True
                detected.append(key)


        if "aadhaar" in detected or "pan" in detected:
            risk_level = "High"

        elif sensitive_found:
            risk_level = "Medium"


        return {

            "risk_level": risk_level,

            "sensitive_data_found": sensitive_found,

            "detected_types": detected,

            "message": "Email scan completed"

        }