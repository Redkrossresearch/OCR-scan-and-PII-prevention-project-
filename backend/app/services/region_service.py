from app.services.matching_service import MatchingService


class RegionService:

    TYPE_MAPPING = {
        "emails": "EMAIL",
        "phone_numbers": "PHONE",
        "aadhaar_numbers": "AADHAAR",
        "pan_numbers": "PAN",
        "passport_numbers": "PASSPORT",
        "credit_cards": "CARD",
        "ssn_numbers": "SSN",
        "ifsc_codes": "IFSC",
        "gstin_numbers": "GSTIN",
        "bank_account_numbers": "BANK_ACCOUNT",
    }

    @staticmethod
    def build_regions(pii_result, ocr_data):

        regions = []
        n = len(ocr_data)

        for key, values in pii_result.items():

            region_type = RegionService.TYPE_MAPPING.get(key, key)

            for value in values:

                for word in ocr_data:
                    if MatchingService.is_match(word["text"], value):
                        regions.append({
                            "type": region_type,
                            "text": value,
                            "ocr_text": word["text"],
                            "left": word["left"],
                            "top": word["top"],
                            "width": word["width"],
                            "height": word["height"],
                        })

                for i in range(n):
                    joined = ""
                    window = []
                    for j in range(i, min(i + 4, n)):
                        window.append(ocr_data[j])
                        joined += ocr_data[j]["text"]

                        if MatchingService.is_match(joined, value):
                            left = min(w["left"] for w in window)
                            top = min(w["top"] for w in window)
                            right = max(w["left"] + w["width"] for w in window)
                            bottom = max(w["top"] + w["height"] for w in window)

                            regions.append({
                                "type": region_type,
                                "text": value,
                                "ocr_text": joined,
                                "left": left,
                                "top": top,
                                "width": right - left,
                                "height": bottom - top,
                            })
                            break

        return regions