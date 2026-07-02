import json
import os


class EDMService:

    DATABASE = "app/data/edm_database.json"

    @staticmethod
    def load_database():

        if not os.path.exists(EDMService.DATABASE):
            return {}

        with open(
            EDMService.DATABASE,
            "r",
            encoding="utf-8",
        ) as file:

            return json.load(file)

    @staticmethod
    def match(pii_result: dict):

        database = EDMService.load_database()

        matches = {}

        for category, values in pii_result.items():

            stored = set(database.get(category, []))

            matched = []

            for value in values:

                if value in stored:
                    matched.append(value)

            matches[category] = matched

        return matches