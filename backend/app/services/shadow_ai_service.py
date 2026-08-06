class ShadowAIService:

    def __init__(self):
        self.ai_tools = [
            "chatgpt",
            "openai",
            "copilot",
            "bard",
            "gemini",
            "claude"
        ]

        self.logs = []


    def detect_ai_usage(
        self,
        application_name: str,
        user: str
    ):

        app_name = application_name.lower()


        if app_name in self.ai_tools:

            self.logs.append({
                "user": user,
                "application": application_name,
                "status": "Detected",
                "action": "Blocked"
            })

            return {
                "shadow_ai_detected": True,
                "message": "Unauthorized AI tool usage detected",
                "input": {"application_name": application_name}
            }


        self.logs.append({
            "user": user,
            "application": application_name,
            "status": "Safe",
            "action": "Allowed"
        })


        return {
            "shadow_ai_detected": False,
            "message": "No unauthorized AI usage detected",
            "input": {"application_name": application_name}
        }



    def get_logs(self):

        return {
            "total_logs": len(self.logs),
            "logs": self.logs
        }