"""Structured CSV export for the Cybersecurity / DLP Assessment.

Builds a tabular CSV with clearly labelled sections and headers from the
unified analysis report produced by the frontend pipeline.
"""

import csv
import io
import uuid
from datetime import datetime


def _fmt_dt(value):
    if not value:
        return ""
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except (ValueError, TypeError):
        return str(value)


def _module_data(report, key):
    mod = report.get(key) or {}
    return mod.get("data") if isinstance(mod.get("data"), dict) else {}


def build_report_csv(report):
    report = report or {}
    document = report.get("document") or {}
    risk = report.get("risk") or {}
    pii_data = _module_data(report, "pii")
    compliance = report.get("compliance") or {}
    recommendations = report.get("recommendations") or []

    report_id = "DLP-" + datetime.now().strftime("%Y%m%d") + "-" + uuid.uuid4().hex[:8].upper()
    generated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["CYBERSECURITY / DLP ASSESSMENT REPORT"])
    writer.writerow(["Report ID", report_id])
    writer.writerow(["Generated At", generated_at])
    writer.writerow([])

    # 1. Document information
    writer.writerow(["SECTION: DOCUMENT INFORMATION"])
    writer.writerow(["Field", "Value"])
    writer.writerow(["Document Name", document.get("filename", "")])
    writer.writerow(["File Extension", (document.get("extension") or "").upper()])
    writer.writerow(["File Size (bytes)", document.get("size", "")])
    writer.writerow(["Analyzed By", document.get("user", "")])
    writer.writerow(["Scan Timestamp", _fmt_dt(document.get("scanned_at"))])
    upload = document.get("upload") or {}
    writer.writerow(["Upload Status", upload.get("message") or upload.get("filename") or ""])
    writer.writerow([])

    # 2. Risk summary
    writer.writerow(["SECTION: RISK SUMMARY"])
    writer.writerow(["Field", "Value"])
    writer.writerow(["Risk Score", risk.get("risk_score", "")])
    writer.writerow(["Risk Level", risk.get("risk_level", "")])
    writer.writerow(["Classification", risk.get("classification", "")])
    access = risk.get("access") or {}
    access_data = access.get("data") or {}
    writer.writerow(["Access Decision", access_data.get("access") or access_data.get("access_allowed", "")])
    writer.writerow(["Access Reason", access_data.get("reason") or access_data.get("access_reason", "")])
    writer.writerow([])

    # 3. PII detection
    writer.writerow(["SECTION: PII DETECTION"])
    writer.writerow(["Data Category", "Count", "Detected Values"])
    categories = [
        ("emails", "Emails"),
        ("phone_numbers", "Phone Numbers"),
        ("aadhaar_numbers", "Aadhaar Numbers"),
        ("pan_numbers", "PAN Numbers"),
        ("passport_numbers", "Passport Numbers"),
        ("credit_cards", "Credit Cards"),
        ("ssn_numbers", "SSN Numbers"),
    ]
    total_pii = 0
    for key, label in categories:
        values = pii_data.get(key) or []
        total_pii += len(values)
        writer.writerow([label, len(values), "; ".join(str(v) for v in values)])
    writer.writerow(["TOTAL", total_pii, ""])
    writer.writerow([])

    # 4. DLP controls
    writer.writerow(["SECTION: DLP CONTROLS RESULTS"])
    writer.writerow(["Control", "Status", "Detail"])
    controls = [
        ("policyAlert", "Policy Alerts"),
        ("emailDlp", "Email DLP"),
        ("clipboard", "Clipboard Control"),
        ("printControl", "Print Control"),
        ("usbControl", "USB Control"),
    ]
    for key, label in controls:
        mod = report.get(key) or {}
        data = mod.get("data") if isinstance(mod.get("data"), dict) else {}
        if not mod.get("ok"):
            writer.writerow([label, "NO DATA", mod.get("error", "")])
            continue
        if key == "policyAlert":
            alert = data.get("alert") or {}
            writer.writerow([label, alert.get("severity") or data.get("message", ""), alert.get("policy_name", "")])
        elif key == "emailDlp":
            writer.writerow([label, "BLOCKED" if data.get("sensitive_data_found") else "CLEAN", "; ".join(data.get("detected_types") or []) or data.get("message", "")])
        elif key == "clipboard":
            writer.writerow([label, "BLOCKED" if data.get("blocked") else "SAFE", data.get("reason", "")])
        elif key == "printControl":
            writer.writerow([label, "ALLOWED" if data.get("allowed") else "BLOCKED", data.get("message", "")])
        elif key == "usbControl":
            writer.writerow([label, "ALLOWED" if data.get("usb_allowed") else "BLOCKED", data.get("message", "")])
    writer.writerow([])

    # 5. AI & behavior
    writer.writerow(["SECTION: AI & BEHAVIOR ANALYSIS"])
    writer.writerow(["Module", "Field", "Value"])
    shadow = report.get("shadowAi") or {}
    shadow_data = shadow.get("data") if isinstance(shadow.get("data"), dict) else {}
    writer.writerow(["Shadow AI", "Unauthorized Tool Detected", "YES" if shadow_data.get("shadow_ai_detected") else "NO"])
    writer.writerow(["Shadow AI", "Message", shadow_data.get("message", "") if shadow.get("ok") else (shadow.get("error") or "NO DATA")])
    ueba = report.get("ueba") or {}
    ueba_data = ueba.get("data") if isinstance(ueba.get("data"), dict) else {}
    writer.writerow(["UEBA", "Analyzed User", ueba_data.get("user", "") if ueba.get("ok") else "NO DATA"])
    writer.writerow(["UEBA", "Behavioral Risk", ueba_data.get("risk_level", "") if ueba.get("ok") else "NO DATA"])
    writer.writerow(["UEBA", "Message", ueba_data.get("message", "") if ueba.get("ok") else (ueba.get("error") or "NO DATA")])
    writer.writerow([])

    # 6. Compliance
    writer.writerow(["SECTION: COMPLIANCE ANALYSIS"])
    writer.writerow(["Control", "Status", "Detail"])
    items = compliance.get("items") or []
    for item in items:
        writer.writerow([item.get("name", ""), item.get("status", ""), item.get("detail", "")])
    if not items:
        writer.writerow(["Compliance", "NO DATA", compliance.get("summary", "")])
    writer.writerow(["Summary", "", compliance.get("summary", "")])
    writer.writerow([])

    # 7. Recommendations
    writer.writerow(["SECTION: RECOMMENDATIONS"])
    writer.writerow(["Index", "Recommendation"])
    for i, rec in enumerate(recommendations, 1):
        writer.writerow([i, rec])
    if not recommendations:
        writer.writerow(["", "No recommendations available"])

    buffer.seek(0)
    return buffer.getvalue()
