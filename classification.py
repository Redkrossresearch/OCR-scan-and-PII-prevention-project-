class DocumentClassifier:

    def __init__(self):

        self.rules = {
            "secret": "Secret",
            "confidential": "Confidential",
            "internal": "Internal",
            "public": "Public"
        }

    def classify(self, text):

        text = text.lower()

        for keyword, level in self.rules.items():
            if keyword in text:
                return {
                    "success": True,
                    "classification": level
                }

        return {
            "success": True,
            "classification": "Public"
        }