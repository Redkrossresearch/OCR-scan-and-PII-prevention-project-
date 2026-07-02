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
    }

    @staticmethod
    def build_regions(
        pii_result: dict,
        ocr_data: list,
    ):

        regions = []

        for key, values in pii_result.items():

            region_type = RegionService.TYPE_MAPPING.get(
                key,
                key,
            )

            for value in values:

                for word in ocr_data:

                    if MatchingService.is_match(
                        word["text"],
                        value,
                    ):

                        regions.append(
                            {
                                "type": region_type,
                                "text": value,
                                "ocr_text": word["text"],
                                "left": word["left"],
                                "top": word["top"],
                                "width": word["width"],
                                "height": word["height"],
                            }
                        )

                        # Stop searching after the first match
                        break

        return regions