class USBControlService:

    def __init__(self):
        self.usb_logs = []


    def check_usb_access(
        self,
        user_role: str,
        device_name: str
    ):

        blocked_roles = [
            "guest",
            "intern"
        ]

        if user_role.lower() in blocked_roles:

            self.usb_logs.append({
                "user_role": user_role,
                "device": device_name,
                "action": "Blocked"
            })

            return {
                "usb_allowed": False,
                "message": "USB access blocked for this user"
            }


        self.usb_logs.append({
            "user_role": user_role,
            "device": device_name,
            "action": "Allowed"
        })

        return {
            "usb_allowed": True,
            "message": "USB access allowed"
        }



    def get_usb_logs(self):

        return {
            "total_logs": len(self.usb_logs),
            "logs": self.usb_logs
        }