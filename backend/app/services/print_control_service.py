class PrintControlService:

    def __init__(self):
        self.print_logs = []

    def check_print_permission(self, user_role: str, document_type: str):

        restricted_documents = [
            "confidential",
            "sensitive",
            "restricted"
        ]

        if document_type.lower() in restricted_documents:

            self.print_logs.append({
                "user_role": user_role,
                "document_type": document_type,
                "action": "Blocked"
            })

            return {
                "allowed": False,
                "message": "Printing blocked for sensitive document",
                "input": {
                    "user_role": user_role,
                    "document_type": document_type
                }
            }

        self.print_logs.append({
            "user_role": user_role,
            "document_type": document_type,
            "action": "Allowed"
        })

        return {
            "allowed": True,
            "message": "Printing allowed",
            "input": {
                "user_role": user_role,
                "document_type": document_type
            }
        }


    def get_print_logs(self):

        return {
            "total_logs": len(self.print_logs),
            "logs": self.print_logs
        }