class FileTypeBlockingService:

    def __init__(self):
        self.blocked_extensions = [
            "exe",
            "bat",
            "dll",
            "msi"
        ]

        self.logs = []


    def check_file_type(
        self,
        filename: str
    ):

        extension = filename.split(".")[-1].lower()


        if extension in self.blocked_extensions:

            self.logs.append({
                "filename": filename,
                "extension": extension,
                "status": "Blocked"
            })

            return {
                "allowed": False,
                "message": f"{extension} files are blocked"
            }


        self.logs.append({
            "filename": filename,
            "extension": extension,
            "status": "Allowed"
        })


        return {
            "allowed": True,
            "message": "File type allowed"
        }



    def get_logs(self):

        return {
            "total_logs": len(self.logs),
            "logs": self.logs
        }