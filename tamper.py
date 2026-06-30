import hashlib

class TamperDetector:

    def calculate_hash(self, file_path):
        sha256 = hashlib.sha256()

        with open(file_path, "rb") as file:
            while chunk := file.read(4096):
                sha256.update(chunk)

        return sha256.hexdigest()

    def verify(self, file_path, original_hash):
        current_hash = self.calculate_hash(file_path)

        return {
            "success": True,
            "tampered": current_hash != original_hash,
            "original_hash": original_hash,
            "current_hash": current_hash
        }
    