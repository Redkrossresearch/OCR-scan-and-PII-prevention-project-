class DashboardAnalytics:

    def __init__(self):
        self.data = {
            "total_documents": 150,
            "classified_documents": 135,
            "watermark_detected": 42,
            "tampered_documents": 8,
            "risk_documents": 27,
            "expired_documents": 5
        }

    def get_dashboard(self):

        return {
            "success": True,
            "dashboard": self.data
        }