"""Enterprise-grade Cybersecurity / DLP Assessment PDF report generator.

Consumes the unified analysis report produced by the frontend pipeline
(see frontend/src/services/analysisService.js) and renders a polished
multi-page PDF using ReportLab.
"""

import uuid
from datetime import datetime
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas as canvas_module
from reportlab.graphics.shapes import Drawing, Rect, Circle, String, Line
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.doughnut import Doughnut
from reportlab.platypus import (
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

# --------------------------------------------------------------------------
# Theme
# --------------------------------------------------------------------------
SLATE_900 = HexColor("#0F172A")
SLATE_800 = HexColor("#1E293B")
SLATE_700 = HexColor("#334155")
SLATE_500 = HexColor("#64748B")
SLATE_300 = HexColor("#CBD5E1")
SLATE_100 = HexColor("#F1F5F9")
INK = HexColor("#0B1220")
BLUE = HexColor("#2563EB")
BLUE_LIGHT = HexColor("#60A5FA")
GREEN = HexColor("#16A34A")
AMBER = HexColor("#D97706")
ORANGE = HexColor("#EA580C")
RED = HexColor("#DC2626")
GREY = HexColor("#6B7280")
WHITE = colors.white

PAGE_W, PAGE_H = A4
MARGIN_LR = 14 * mm
MARGIN_TOP = 22 * mm
MARGIN_BOTTOM = 20 * mm
CONTENT_W = PAGE_W - 2 * MARGIN_LR

PII_CATEGORIES = [
    ("emails", "Emails"),
    ("phone_numbers", "Phone Numbers"),
    ("aadhaar_numbers", "Aadhaar Numbers"),
    ("pan_numbers", "PAN Numbers"),
    ("passport_numbers", "Passport Numbers"),
    ("credit_cards", "Credit Cards"),
    ("ssn_numbers", "SSN Numbers"),
]


def _risk_color(level):
    lvl = str(level or "").lower()
    if "crit" in lvl:
        return RED
    if "high" in lvl:
        return ORANGE
    if "medium" in lvl or "med" in lvl:
        return AMBER
    return GREEN


def _status_color(status):
    st = str(status or "").lower()
    if st in ("pass", "passed", "allowed", "safe", "clean", "ok", "granted", "low"):
        return GREEN
    if st in ("fail", "failed", "blocked", "detected", "denied", "critical", "high"):
        return RED
    if st in ("review", "medium"):
        return AMBER
    return GREY


def _para(text, style):
    if isinstance(text, Paragraph) or isinstance(text, Preformatted):
        return text
    return Paragraph(str(text or ""), style)


def _badge(text, color):
    return Paragraph(
        '<para align="center" backcolor="%s">'
        '<font color="white"><b>%s</b></font></para>'
        % (color.hexval(), str(text or "—")),
        ParagraphStyle(
            "Badge",
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=10,
            borderPadding=(4, 8, 4, 8),
            spaceBefore=0,
            spaceAfter=0,
        ),
    )


# --------------------------------------------------------------------------
# Report data access helpers
# --------------------------------------------------------------------------
def _module(report, key):
    return report.get(key) or {}


def _ok(report, key):
    return bool(_module(report, key).get("ok"))


def _data(report, key):
    mod = _module(report, key)
    return mod.get("data") or {}


def _module_error(report, key):
    return _module(report, key).get("error")


def _pii(report):
    return _data(report, "pii")


def _fmt_size(size):
    try:
        size = float(size)
    except (TypeError, ValueError):
        return "—"
    if size < 1024:
        return "%.0f B" % size
    if size < 1024 * 1024:
        return "%.1f KB" % (size / 1024)
    return "%.2f MB" % (size / (1024 * 1024))


def _fmt_dt(value):
    if not value:
        return "—"
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return dt.strftime("%d %b %Y, %H:%M:%S")
    except (ValueError, TypeError):
        return str(value)


# --------------------------------------------------------------------------
# Numbered canvas (Page X of Y)
# --------------------------------------------------------------------------
class NumberedCanvas(canvas_module.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.setFont("Helvetica", 7.5)
        self.setFillColor(SLATE_500)
        self.drawCentredString(
            PAGE_W / 2,
            MARGIN_BOTTOM / 2 - 3,
            "Page %d of %d" % (self._pageNumber, page_count),
        )


# --------------------------------------------------------------------------
# Page decoration (header + footer bands)
# --------------------------------------------------------------------------
def _page_decoration(report_id, generated_at):
    def draw(canv, doc):
        # Header band
        canv.saveState()
        canv.setFillColor(SLATE_900)
        canv.rect(0, PAGE_H - 15 * mm, PAGE_W, 15 * mm, stroke=0, fill=1)
        canv.setFillColor(BLUE)
        canv.rect(0, PAGE_H - 15 * mm, PAGE_W, 1.6 * mm, stroke=0, fill=1)
        canv.setFillColor(WHITE)
        canv.setFont("Helvetica-Bold", 9)
        canv.drawString(MARGIN_LR, PAGE_H - 9.5 * mm, "CYBERSECURITY / DLP ASSESSMENT REPORT")
        canv.setFont("Helvetica", 7.5)
        canv.setFillColor(SLATE_300)
        canv.drawRightString(PAGE_W - MARGIN_LR, PAGE_H - 9.5 * mm, "Report ID: %s" % report_id)

        # Diagonal confidential watermark
        canv.saveState()
        canv.setFont("Helvetica-Bold", 52)
        canv.setFillColor(HexColor("#E2E8F0"))
        canv.setFillAlpha(0.35)
        canv.saveState()
        canv.translate(PAGE_W / 2, PAGE_H / 2)
        canv.rotate(32)
        canv.drawCentredString(0, 0, "CONFIDENTIAL")
        canv.restoreState()
        canv.restoreState()

        # Footer band
        canv.setStrokeColor(SLATE_300)
        canv.setLineWidth(0.4)
        canv.line(MARGIN_LR, 12 * mm, PAGE_W - MARGIN_LR, 12 * mm)
        canv.setFont("Helvetica", 6.5)
        canv.setFillColor(SLATE_500)
        canv.drawString(MARGIN_LR, 8 * mm, "Generated: %s" % generated_at)
        canv.drawRightString(PAGE_W - MARGIN_LR, 8 * mm, "CONFIDENTIAL - Authorized use only")
        canv.restoreState()

    return draw


# --------------------------------------------------------------------------
# Flowable helpers
# --------------------------------------------------------------------------
def _section_band(title, accent=BLUE, width=CONTENT_W):
    p = Paragraph(
        '<font color="white"><b>%s</b></font>' % title,
        ParagraphStyle(
            "SectionTitle",
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=WHITE,
        ),
    )
    table = Table([[p]], colWidths=[width])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), SLATE_900),
                ("LINEBEFORE", (0, 0), (0, -1), 4, accent),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ]
        )
    )
    return table


def _kv_table(rows, width=CONTENT_W, col_ratio=0.34):
    col1 = width * col_ratio
    col2 = width - col1
    body = []
    for label, value in rows:
        body.append(
            [
                Paragraph(
                    '<font color="%s"><b>%s</b></font>' % (SLATE_500.hexval(), label),
                    ParagraphStyle("K", fontName="Helvetica-Bold", fontSize=8.5, leading=11),
                ),
                value,
            ]
        )
    t = Table(body, colWidths=[col1, col2])
    style = [
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]
    for i in range(len(body)):
        if i % 2 == 0:
            style.append(("BACKGROUND", (0, i), (-1, i), SLATE_100))
    t.setStyle(TableStyle(style))
    return t


def _data_table(headers, rows, widths=None, text_size=8.5):
    head = [
        Paragraph(
            '<font color="white"><b>%s</b></font>' % h,
            ParagraphStyle("H", fontName="Helvetica-Bold", fontSize=8.5, leading=10),
        )
        for h in headers
    ]
    body = [head]
    for row in rows:
        body.append([_para(c, ParagraphStyle("C", fontName="Helvetica", fontSize=text_size, leading=11)) for c in row])

    col_widths = widths or [CONTENT_W / len(headers)] * len(headers)
    t = Table(body, colWidths=col_widths, repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), SLATE_800),
        ("GRID", (0, 0), (-1, -1), 0.4, SLATE_300),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(body)):
        if i % 2 == 0:
            style.append(("BACKGROUND", (0, i), (-1, i), SLATE_100))
    t.setStyle(TableStyle(style))
    return t


def _note(text, color=GREY, font_size=8.5):
    return Paragraph(
        '<font color="%s"><i>%s</i></font>' % (color.hexval(), text),
        ParagraphStyle("Note", fontName="Helvetica-Oblique", fontSize=font_size, leading=11),
    )


# --------------------------------------------------------------------------
# Charts
# --------------------------------------------------------------------------
def _risk_gauge(score):
    score = max(0, min(100, int(score or 0)))
    width = CONTENT_W
    bar_h = 14 * mm
    height = 34 * mm
    seg_w = width / 4.0
    seg_colors = [GREEN, AMBER, ORANGE, RED]
    labels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    drawing = Drawing(width, height)
    for i, (col, lab) in enumerate(zip(seg_colors, labels)):
        drawing.add(Rect(i * seg_w, height - bar_h - 8, seg_w, bar_h, fillColor=col, strokeColor=None))
        drawing.add(
            String(
                i * seg_w + seg_w / 2,
                height - 4,
                lab,
                fontName="Helvetica-Bold",
                fontSize=7,
                fillColor=col,
                textAnchor="middle",
            )
        )
    # boundary ticks
    for i in range(5):
        x = i * seg_w
        drawing.add(String(x, height - bar_h - 14, str(i * 25), fontName="Helvetica", fontSize=6.5, fillColor=SLATE_500, textAnchor="middle"))
        drawing.add(Rect(x - 0.3, height - bar_h - 6, 0.6, 6, fillColor=SLATE_500, strokeColor=None))

    # marker
    mx = score / 100.0 * width
    drawing.add(Line(mx, height - bar_h - 18, mx, height - bar_h + bar_h + 4, strokeColor=INK, strokeWidth=1.2))
    drawing.add(
        Circle(
            mx,
            height - bar_h + bar_h + 6,
            5,
            fillColor=WHITE,
            strokeColor=INK,
            strokeWidth=1.5,
        )
    )
    return drawing


def _pii_bar_chart(counts, labels):
    width = CONTENT_W
    height = 60 * mm
    chart = VerticalBarChart()
    chart.x = 6
    chart.y = 8
    chart.width = width - 12
    chart.height = height - 20
    chart.data = [counts]
    chart.categoryAxis.categoryNames = labels
    chart.categoryAxis.labels.fontSize = 7
    chart.categoryAxis.labels.angle = 25
    chart.valueAxis.valueMin = 0
    chart.valueAxis.valueMax = max(counts) + 1 if counts and max(counts) > 0 else 2
    chart.valueAxis.valueStep = 1 if chart.valueAxis.valueMax <= 8 else 2
    chart.valueAxis.labels.fontSize = 7
    chart.bars[0].fillColor = BLUE
    chart.bars[0].strokeColor = BLUE
    chart.barLabels.fontSize = 7
    chart.barLabels.nudge = 8
    chart.barLabelFormat = "%.0f"

    drawing = Drawing(width, height)
    drawing.add(chart)
    return drawing


def _compliance_donut(items):
    passes = sum(1 for it in items if str(it.get("status", "")).lower() == "pass")
    fails = sum(1 for it in items if str(it.get("status", "")).lower() == "fail")
    reviews = sum(1 for it in items if str(it.get("status", "")).lower() == "review")
    data = []
    labels = []
    colorset = []
    if passes:
        data.append(passes)
        labels.append("Pass")
        colorset.append(GREEN)
    if fails:
        data.append(fails)
        labels.append("Fail")
        colorset.append(RED)
    if reviews:
        data.append(reviews)
        labels.append("Review")
        colorset.append(AMBER)

    width = 80 * mm
    height = 50 * mm
    drawing = Drawing(width, height)
    if data:
        donut = Doughnut()
        donut.x = 8
        donut.y = 4
        donut.width = 46 * mm
        donut.height = 46 * mm
        donut.data = data
        donut.labels = labels
        donut.slices.strokeColor = WHITE
        donut.slices.strokeWidth = 1
        donut.slices.fontSize = 8
        for idx, col in enumerate(colorset):
            donut.slices[idx].fillColor = col
        drawing.add(donut)
        # legend
        ly = height - 10
        for col, lab, val in zip(colorset, labels, data):
            drawing.add(Rect(width - 55, ly, 8, 8, fillColor=col, strokeColor=None))
            drawing.add(
                String(
                    width - 43,
                    ly - 1,
                    "%s (%d)" % (lab, val),
                    fontName="Helvetica",
                    fontSize=8,
                    fillColor=INK,
                    textAnchor="start",
                )
            )
            ly -= 12
    return drawing


# --------------------------------------------------------------------------
# Report builder
# --------------------------------------------------------------------------
class PDFReportBuilder:
    def __init__(self, report):
        self.report = report or {}
        self.document = self.report.get("document") or {}
        self.report_id = "DLP-" + datetime.now().strftime("%Y%m%d") + "-" + uuid.uuid4().hex[:8].upper()
        self.generated_at = datetime.now().strftime("%d %b %Y %H:%M:%S")

        self.styles = {
            "Body": ParagraphStyle(
                "Body",
                fontName="Helvetica",
                fontSize=9,
                leading=12.5,
                textColor=INK,
            ),
            "BodySm": ParagraphStyle(
                "BodySm",
                fontName="Helvetica",
                fontSize=8.5,
                leading=11.5,
                textColor=INK,
            ),
        }

    # ------------------------------------------------------------------ sections
    def _cover_header(self):
        flow = []
        flow.append(
            Paragraph(
                '<font color="white"><b>CYBERSECURITY / DLP ASSESSMENT</b></font>',
                ParagraphStyle("T1", fontName="Helvetica-Bold", fontSize=7.5, leading=9, textColor=BLUE_LIGHT),
            )
        )
        flow.append(Spacer(1, 2 * mm))
        flow.append(
            Paragraph(
                '<font color="white"><b>Data Leak Prevention &amp; Security Analysis Report</b></font>',
                ParagraphStyle("T2", fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=WHITE),
            )
        )
        flow.append(Spacer(1, 2 * mm))
        flow.append(
            Paragraph(
                '<font color="#94A3B8">Automated multi-module analysis: OCR, PII detection, risk assessment, '
                'DLP controls and AI / behavior analytics.</font>',
                ParagraphStyle("T3", fontName="Helvetica", fontSize=9, leading=13, textColor=HexColor("#94A3B8")),
            )
        )
        cover = Table([[flow]], colWidths=[CONTENT_W])
        cover.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), SLATE_900),
                    ("TOPPADDING", (0, 0), (-1, -1), 18),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 18),
                    ("LEFTPADDING", (0, 0), (-1, -1), 16),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 16),
                    ("LINEBELOW", (0, 0), (-1, -1), 4, BLUE),
                ]
            )
        )
        return cover

    def _summary_stats(self, risk_level, classification, pii_count, dlp_blocked, dlp_total):
        risk_color = _risk_color(risk_level)
        badges = [
            Paragraph(
                '<para align="center"><font color="white"><b>OVERALL RISK</b></font><br/>'
                '<font color="white" size="13"><b>%s</b></font></para>' % (risk_level or "—"),
                ParagraphStyle("B", fontName="Helvetica", fontSize=7, leading=10, textColor=WHITE, backColor=risk_color.hexval(), borderPadding=6),
            ),
            Paragraph(
                '<para align="center"><font color="white"><b>CLASSIFICATION</b></font><br/>'
                '<font color="white" size="13"><b>%s</b></font></para>' % (classification or "—"),
                ParagraphStyle("B", fontName="Helvetica", fontSize=7, leading=10, textColor=WHITE, backColor=SLATE_700.hexval(), borderPadding=6),
            ),
            Paragraph(
                '<para align="center"><font color="white"><b>PII ITEMS</b></font><br/>'
                '<font color="white" size="13"><b>%s</b></font></para>' % pii_count,
                ParagraphStyle("B", fontName="Helvetica", fontSize=7, leading=10, textColor=WHITE, backColor=SLATE_700.hexval(), borderPadding=6),
            ),
            Paragraph(
                '<para align="center"><font color="white"><b>DLP BLOCKS</b></font><br/>'
                '<font color="white" size="13"><b>%d/%d</b></font></para>' % (dlp_blocked, dlp_total),
                ParagraphStyle("B", fontName="Helvetica", fontSize=7, leading=10, textColor=WHITE, backColor=(RED if dlp_blocked else GREEN).hexval(), borderPadding=6),
            ),
        ]
        widths = [CONTENT_W / 4.0] * 4
        t = Table([badges], colWidths=widths)
        t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 2), ("RIGHTPADDING", (0, 0), (-1, -1), 2)]))
        return t

    def _executive_summary(self, flow):
        risk = self.report.get("risk") or {}
        risk_level = risk.get("risk_level")
        classification = risk.get("classification")
        pii_data = _pii(self.report)
        pii_count = sum(len(pii_data.get(key) or []) for key, _ in PII_CATEGORIES)

        controls = [
            ("policyAlert", "Policy Alert"),
            ("emailDlp", "Email DLP"),
            ("clipboard", "Clipboard Control"),
            ("printControl", "Print Control"),
            ("usbControl", "USB Control"),
            ("fileType", "File Type Blocking"),
        ]
        dlp_total = len(controls)
        dlp_blocked = 0
        for key, _ in controls:
            data = _data(self.report, key)
            if key == "policyAlert":
                pass
            elif data.get("blocked") or data.get("allowed") is False or data.get("usb_allowed") is False:
                dlp_blocked += 1
        compliance = self.report.get("compliance") or {}
        failed_controls = sum(1 for it in compliance.get("items", []) if str(it.get("status", "")).lower() == "fail")

        filename = self.document.get("filename") or "—"
        user = self.document.get("user") or "—"
        scanned_at = _fmt_dt(self.document.get("scanned_at"))

        summary_lines = [
            "This report presents the outcome of an automated cybersecurity and Data Loss Prevention (DLP) "
            "assessment for the document <b>&quot;%s&quot;</b> analyzed by <b>%s</b> on <b>%s</b>."
            % (filename, user, scanned_at),
            "",
            "The document was passed through a unified analysis pipeline comprising OCR text extraction, PII "
            "detection, sensitive-data classification, risk scoring, six DLP controls (policy alerts, email DLP, "
            "clipboard, print, USB and file-type) and AI / user-behavior analytics (Shadow AI and UEBA).",
            "",
        ]
        if risk_level:
            summary_lines.append(
                "The overall risk rating is <font color='%s'><b>%s</b></font>. " % (_risk_color(risk_level).hexval(), risk_level)
            )
            if pii_count:
                summary_lines.append(
                    "<b>%d</b> sensitive data item(s) were identified in the document content, and the document is "
                    "classified as <b>%s</b>." % (pii_count, classification or "Unclassified")
                )
            else:
                summary_lines.append("No regulated sensitive data items were identified in the document content.")
        if dlp_blocked:
            summary_lines.append(
                " <b>%d</b> of <b>%d</b> DLP controls required blocking, indicating active data-exfiltration "
                "prevention measures engaged." % (dlp_blocked, dlp_total)
            )
        else:
            summary_lines.append(
                " None of the <b>%d</b> DLP controls required blocking for this scan." % dlp_total
            )
        if failed_controls:
            summary_lines.append(
                " <b>%d</b> compliance control(s) failed validation and require remediation." % failed_controls
            )
        summary_lines.append("")

        flow.append(self._cover_header())
        flow.append(Spacer(1, 5 * mm))
        flow.append(self._summary_stats(risk_level, classification, pii_count, dlp_blocked, dlp_total))
        flow.append(Spacer(1, 4 * mm))
        flow.append(_section_band("1. Executive Summary", accent=BLUE))
        flow.append(Spacer(1, 2 * mm))
        for line in summary_lines:
            flow.append(_para(line, self.styles["Body"]))
            flow.append(Spacer(1, 1.5 * mm))
        return flow

    def _document_info(self, flow):
        upload = self.document.get("upload") or {}
        rows = [
            ("Document Name", _para(self.document.get("filename") or "—", self.styles["BodySm"])),
            ("File Extension", _para((self.document.get("extension") or "—").upper(), self.styles["BodySm"])),
            ("File Size", _para(_fmt_size(self.document.get("size")), self.styles["BodySm"])),
            ("Analyzed By", _para(self.document.get("user") or "—", self.styles["BodySm"])),
            ("Scan Timestamp", _para(_fmt_dt(self.document.get("scanned_at")), self.styles["BodySm"])),
            ("Upload Status", _para(upload.get("message") or upload.get("filename") or "—", self.styles["BodySm"])),
            ("Report ID", _para(self.report_id, self.styles["BodySm"])),
        ]
        flow.append(_section_band("2. Document Information", accent=BLUE))
        flow.append(Spacer(1, 2 * mm))
        flow.append(_kv_table(rows))
        return flow

    def _ocr_results(self, flow):
        data = _data(self.report, "ocr")
        text = data.get("extracted_text") or ""
        rows = [
            ("Source File", _para(data.get("filename") or self.document.get("filename") or "—", self.styles["BodySm"])),
            ("Detected Type", _para((data.get("file_type") or "—").upper(), self.styles["BodySm"])),
            ("Extracted Characters", _para(str(len(text)), self.styles["BodySm"])),
            ("Extraction Status", _badge("SUCCESS" if _ok(self.report, "ocr") else "FAILED", GREEN if _ok(self.report, "ocr") else RED)),
        ]
        flow.append(_section_band("3. OCR Results", accent=BLUE))
        flow.append(Spacer(1, 2 * mm))
        flow.append(_kv_table(rows))
        flow.append(Spacer(1, 2 * mm))
        if not _ok(self.report, "ocr"):
            flow.append(_note("No data available - OCR extraction module did not return results. %s" % (_module_error(self.report, "ocr") or "")))
        elif text:
            preview = text if len(text) <= 2200 else text[:2200] + "\n[... truncated ...]"
            pt = Preformatted(
                preview,
                ParagraphStyle(
                    "Pre",
                    fontName="Courier",
                    fontSize=7,
                    leading=9,
                    backColor=SLATE_100,
                    borderPadding=6,
                    textColor=INK,
                ),
            )
            t = Table([[pt]], colWidths=[CONTENT_W])
            t.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.5, SLATE_300), ("BACKGROUND", (0, 0), (-1, -1), SLATE_100)]))
            flow.append(t)
        else:
            flow.append(_note("No data available - no text was extracted from the document."))
        return flow

    def _pii_table(self, flow):
        pii_data = _pii(self.report)
        rows = []
        total = 0
        for key, label in PII_CATEGORIES:
            values = pii_data.get(key) or []
            total += len(values)
            shown = ", ".join(str(v) for v in values[:3])
            if len(values) > 3:
                shown += " (+%d more)" % (len(values) - 3)
            if not values:
                shown = "—"
            rows.append([label, str(len(values)), shown])
        flow.append(_section_band("4. PII Detection Table", accent=BLUE))
        flow.append(Spacer(1, 2 * mm))
        if not _ok(self.report, "pii"):
            flow.append(_note("No data available - PII detection module did not return results. %s" % (_module_error(self.report, "pii") or "")))
        else:
            flow.append(
                _data_table(
                    ["Data Category", "Count", "Detected Values"],
                    rows,
                    widths=[CONTENT_W * 0.32, CONTENT_W * 0.1, CONTENT_W * 0.58],
                )
            )
            flow.append(Spacer(1, 1.5 * mm))
            flow.append(
                _para(
                    '<font color="%s"><b>Total sensitive items detected: %d</b></font>'
                    % (RED.hexval() if total else GREY.hexval(), total),
                    self.styles["BodySm"],
                )
            )
        return flow

    def _classification_section(self, flow):
        risk = self.report.get("risk") or {}
        classification = risk.get("classification") or "Unclassified"
        pii_data = _pii(self.report)
        back_class = pii_data.get("classification") or classification
        if isinstance(back_class, dict):
            back_class = back_class.get("classification", classification)

        levels = ["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"]
        rows = []
        for lvl in levels:
            current = str(back_class).upper() == lvl
            rows.append(
                [
                    _badge(lvl, _status_color(lvl) if current else GREY),
                    _para("Recommended when risk is LOW." if lvl == "PUBLIC" else "Suitable for internal distribution only." if lvl == "INTERNAL" else "Access limited to authorized personnel." if lvl == "CONFIDENTIAL" else "Strictly restricted; administrators only.", self.styles["BodySm"]),
                ]
            )

        flow.append(_section_band("5. Sensitive Data Classification", accent=BLUE))
        flow.append(Spacer(1, 2 * mm))
        flow.append(_kv_table([("Assigned Classification", _badge(back_class, _risk_color(risk.get("risk_level"))))]))
        flow.append(Spacer(1, 2 * mm))
        flow.append(_data_table(["Classification Level", "Description"], rows, widths=[CONTENT_W * 0.3, CONTENT_W * 0.7]))
        return flow

    def _risk_analysis(self, flow):
        risk = self.report.get("risk") or {}
        risk_level = risk.get("risk_level") or "—"
        risk_score = risk.get("risk_score") or 0
        try:
            risk_score = int(risk_score)
        except (TypeError, ValueError):
            risk_score = 0
        pii_data = _pii(self.report)
        breakdown = pii_data.get("risk_breakdown") or {}

        reasons = []
        for key, label in PII_CATEGORIES:
            count = len(pii_data.get(key) or [])
            if count:
                reasons.append("%s detected (%d occurrence%s)" % (label, count, "s" if count != 1 else ""))
        kw = pii_data.get("keywords") or []
        if isinstance(kw, list) and kw:
            reasons.append("Sensitive keywords detected (%d term%s)" % (len(kw), "s" if len(kw) != 1 else ""))
        if not reasons:
            reasons.append("No sensitive patterns matched during PII analysis.")

        access = risk.get("access") or {}
        access_data = access.get("data") or {}

        flow.append(_section_band("6. Risk Analysis", accent=_risk_color(risk_level)))
        flow.append(Spacer(1, 2 * mm))
        flow.append(_risk_gauge(risk_score))
        flow.append(Spacer(1, 3 * mm))
        rows = [
            ("Risk Score", _para(str(risk_score), self.styles["BodySm"])),
            ("Risk Level", _badge(risk_level, _risk_color(risk_level))),
            ("Classification", _badge(risk.get("classification") or "—", SLATE_700)),
            ("Access Decision", _para(access_data.get("access") or access_data.get("access_allowed") or "—", self.styles["BodySm"])),
            ("Access Reason", _para(access_data.get("reason") or access_data.get("access_reason") or access_data.get("access") or "—", self.styles["BodySm"])),
        ]
        flow.append(_kv_table(rows))
        flow.append(Spacer(1, 2 * mm))
        breakdown_rows = [
            ["Score Contribution", "Count"]
        ]
        for key, count in (breakdown or {}).items():
            breakdown_rows.append([str(key).replace("_", " ").title(), str(count)])
        flow.append(_para('<b>Risk score breakdown</b>', self.styles["BodySm"]))
        flow.append(Spacer(1, 1.5 * mm))
        if breakdown:
            flow.append(_data_table(["Score Contribution", "Count"], breakdown_rows[1:], widths=[CONTENT_W * 0.8, CONTENT_W * 0.2]))
        else:
            flow.append(_note("No data available - risk breakdown was not returned."))
        flow.append(Spacer(1, 2 * mm))
        flow.append(_para('<b>Reasons for risk rating</b>', self.styles["BodySm"]))
        flow.append(Spacer(1, 1.5 * mm))
        for i, reason in enumerate(reasons, 1):
            flow.append(_para("&bull; %s" % reason, self.styles["BodySm"]))
            flow.append(Spacer(1, 1 * mm))
        return flow

    def _dlp_module(self, flow, key, title, badge_row):
        data = _data(self.report, key)
        ok = _ok(self.report, key)
        color = GREY
        status_text = "NO DATA"
        if ok:
            blocked, color, status_text = badge_row(data)
        flow.append(_section_band(title, accent=color))
        flow.append(Spacer(1, 2 * mm))
        if not ok:
            flow.append(_note("No data available - %s did not return results. %s" % (title, _module_error(self.report, key) or "")))
            return flow
        rows = [(title + " Status", _badge(status_text, color))]
        flow.append(_kv_table(rows))
        flow.append(Spacer(1, 1.5 * mm))
        return flow

    def _dlp_controls(self, flow):
        flow.append(_section_band("7. DLP Controls Results", accent=BLUE))
        flow.append(Spacer(1, 2 * mm))
        summary_rows = []
        checks = [
            ("policyAlert", "Policy Alerts"),
            ("emailDlp", "Email DLP"),
            ("clipboard", "Clipboard Control"),
            ("printControl", "Print Control"),
            ("usbControl", "USB Control"),
            ("fileType", "File Type Blocking"),
        ]
        for key, title in checks:
            data = _data(self.report, key)
            ok = _ok(self.report, key)
            if not ok:
                summary_rows.append([title, _badge("NO DATA", GREY), "—"])
                continue
            if key == "policyAlert":
                alert = data.get("alert") or {}
                sev = (alert.get("severity") or data.get("severity") or "INFO")
                summary_rows.append([title, _badge(sev, _status_color(sev)), (alert.get("policy_name") or data.get("message") or "—")])
            elif key == "emailDlp":
                found = bool(data.get("sensitive_data_found"))
                summary_rows.append([title, _badge("BLOCKED" if found else "CLEAN", RED if found else GREEN), (data.get("message") or "—")])
            elif key == "clipboard":
                blocked = bool(data.get("blocked"))
                summary_rows.append([title, _badge("BLOCKED" if blocked else "SAFE", RED if blocked else GREEN), (data.get("reason") or "—")])
            elif key == "printControl":
                allowed = data.get("allowed")
                summary_rows.append([title, _badge("ALLOWED" if allowed else "BLOCKED", GREEN if allowed else RED), (data.get("message") or "—")])
            elif key == "usbControl":
                allowed = data.get("usb_allowed")
                summary_rows.append([title, _badge("ALLOWED" if allowed else "BLOCKED", GREEN if allowed else RED), (data.get("message") or "—")])
            elif key == "fileType":
                allowed = data.get("allowed")
                summary_rows.append([title, _badge("ALLOWED" if allowed else "BLOCKED", GREEN if allowed else RED), (data.get("message") or "—")])

        flow.append(_data_table(["Control", "Status", "Detail"], summary_rows, widths=[CONTENT_W * 0.28, CONTENT_W * 0.2, CONTENT_W * 0.52]))
        flow.append(Spacer(1, 3 * mm))

        # detailed sub-sections
        for key, title in checks:
            data = _data(self.report, key)
            ok = _ok(self.report, key)
            if not ok:
                flow.append(_section_band("7.%d %s" % (checks.index((key, title)) + 1, title), accent=GREY))
                flow.append(Spacer(1, 1.5 * mm))
                flow.append(_note("No data available - %s did not return results. %s" % (title, _module_error(self.report, key) or "")))
                flow.append(Spacer(1, 3 * mm))
                continue

            if key == "policyAlert":
                alert = data.get("alert") or {}
                sev = alert.get("severity") or data.get("severity") or "INFO"
                rows = [
                    ("Policy Name", _para(alert.get("policy_name") or data.get("message") or "—", self.styles["BodySm"])),
                    ("Severity", _badge(sev, _status_color(sev))),
                    ("Affected User", _para(alert.get("user") or "—", self.styles["BodySm"])),
                    ("Status", _badge(alert.get("status") or "ACTIVE", GREEN)),
                    ("Description", _para(alert.get("description") or data.get("message") or "—", self.styles["BodySm"])),
                ]
            elif key == "emailDlp":
                found = bool(data.get("sensitive_data_found"))
                detected = ", ".join(data.get("detected_types") or []) or "—"
                rows = [
                    ("Risk Level", _badge(data.get("risk_level") or "—", _risk_color(data.get("risk_level")))),
                    ("Sensitive Data Found", _badge("YES" if found else "NO", RED if found else GREEN)),
                    ("Detected Types", _para(detected, self.styles["BodySm"])),
                    ("Message", _para(data.get("message") or "—", self.styles["BodySm"])),
                ]
            elif key == "clipboard":
                blocked = bool(data.get("blocked"))
                rows = [
                    ("Blocked", _badge("YES" if blocked else "NO", RED if blocked else GREEN)),
                    ("Reason", _para(data.get("reason") or "—", self.styles["BodySm"])),
                ]
            elif key == "printControl":
                allowed = data.get("allowed")
                rows = [
                    ("Allowed", _badge("YES" if allowed else "NO", GREEN if allowed else RED)),
                    ("Message", _para(data.get("message") or "—", self.styles["BodySm"])),
                ]
            elif key == "usbControl":
                allowed = data.get("usb_allowed")
                rows = [
                    ("Allowed", _badge("YES" if allowed else "NO", GREEN if allowed else RED)),
                    ("Message", _para(data.get("message") or "—", self.styles["BodySm"])),
                ]
            else:  # fileType
                allowed = data.get("allowed")
                rows = [
                    ("Allowed", _badge("YES" if allowed else "NO", GREEN if allowed else RED)),
                    ("Message", _para(data.get("message") or "—", self.styles["BodySm"])),
                ]

            flow.append(_section_band("7.%d %s" % (checks.index((key, title)) + 1, title), accent=(RED if (data.get("blocked") or data.get("allowed") is False or data.get("usb_allowed") is False) else GREEN)))
            flow.append(Spacer(1, 1.5 * mm))
            flow.append(_kv_table(rows))
            flow.append(Spacer(1, 3 * mm))
        return flow

    def _ai_behavior(self, flow):
        flow.append(_section_band("8. AI & Behavior Analysis", accent=BLUE))
        flow.append(Spacer(1, 2 * mm))

        # Shadow AI
        data = _data(self.report, "shadowAi")
        ok = _ok(self.report, "shadowAi")
        detected = bool(data.get("shadow_ai_detected"))
        flow.append(_section_band("8.1 Shadow AI Detection", accent=RED if detected else GREEN))
        flow.append(Spacer(1, 1.5 * mm))
        if not ok:
            flow.append(_note("No data available - Shadow AI detection did not return results. %s" % (_module_error(self.report, "shadowAi") or "")))
        else:
            rows = [
                ("Unauthorized AI Tool Detected", _badge("YES" if detected else "NO", RED if detected else GREEN)),
                ("Message", _para(data.get("message") or "—", self.styles["BodySm"])),
            ]
            flow.append(_kv_table(rows))
        flow.append(Spacer(1, 3 * mm))

        # UEBA
        data = _data(self.report, "ueba")
        ok = _ok(self.report, "ueba")
        ueba_risk = data.get("risk_level")
        flow.append(_section_band("8.2 User & Entity Behavior Analytics (UEBA)", accent=_risk_color(ueba_risk)))
        flow.append(Spacer(1, 1.5 * mm))
        if not ok:
            flow.append(_note("No data available - UEBA did not return results. %s" % (_module_error(self.report, "ueba") or "")))
        else:
            rows = [
                ("Analyzed User", _para(data.get("user") or "—", self.styles["BodySm"])),
                ("Behavioral Risk", _badge(ueba_risk or "—", _risk_color(ueba_risk))),
                ("Message", _para(data.get("message") or "—", self.styles["BodySm"])),
            ]
            flow.append(_kv_table(rows))
        return flow

    def _compliance(self, flow):
        compliance = self.report.get("compliance") or {}
        items = compliance.get("items") or []
        summary = compliance.get("summary") or "No compliance data available"

        flow.append(_section_band("9. Compliance Analysis", accent=BLUE))
        flow.append(Spacer(1, 2 * mm))
        flow.append(_para('<b>Summary:</b> %s' % summary, self.styles["Body"]))

        if items:
            rows = []
            for it in items:
                status = str(it.get("status", "")).lower()
                color = _status_color(status)
                rows.append(
                    [
                        _para(it.get("name") or "—", self.styles["BodySm"]),
                        _badge((status or "—").upper(), color),
                        _para(it.get("detail") or "—", self.styles["BodySm"]),
                    ]
                )
            flow.append(Spacer(1, 2 * mm))
            flow.append(_data_table(["Control", "Status", "Detail"], rows, widths=[CONTENT_W * 0.26, CONTENT_W * 0.16, CONTENT_W * 0.58]))
            flow.append(Spacer(1, 2 * mm))
            chart = _compliance_donut(items)
            chart_table = Table([[chart]], colWidths=[CONTENT_W])
            chart_table.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "LEFT")]))
            flow.append(chart_table)
        else:
            flow.append(Spacer(1, 2 * mm))
            flow.append(_note("No data available - compliance analysis did not return any items."))
        return flow

    def _recommendations(self, flow):
        recs = self.report.get("recommendations") or []
        flow.append(_section_band("10. Recommendations", accent=BLUE))
        flow.append(Spacer(1, 2 * mm))
        if not recs:
            flow.append(_note("No data available - no recommendations were generated."))
            return flow
        for i, rec in enumerate(recs, 1):
            t = Table(
                [
                    [
                        Paragraph('<font color="white"><b>%d</b></font>' % i, ParagraphStyle("N", fontName="Helvetica-Bold", fontSize=9, leading=11, alignment=TA_CENTER)),
                        Paragraph(str(rec), self.styles["Body"]),
                    ]
                ],
                colWidths=[10 * mm, CONTENT_W - 10 * mm],
            )
            t.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (0, 0), BLUE),
                        ("BACKGROUND", (1, 0), (1, 0), SLATE_100),
                        ("BOX", (0, 0), (-1, -1), 0.4, SLATE_300),
                        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                        ("TOPPADDING", (0, 0), (-1, -1), 6),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ]
                )
            )
            flow.append(t)
            flow.append(Spacer(1, 2 * mm))
        return flow

    def _charts_section(self, flow):
        pii_data = _pii(self.report)
        counts = []
        labels = []
        for key, label in PII_CATEGORIES:
            counts.append(len(pii_data.get(key) or []))
            labels.append(label.split()[0])
        risk = self.report.get("risk") or {}
        score = risk.get("risk_score") or 0
        try:
            score = int(score)
        except (TypeError, ValueError):
            score = 0
        compliance = self.report.get("compliance") or {}
        items = compliance.get("items") or []

        flow.append(_section_band("11. Visual Analytics", accent=BLUE))
        flow.append(Spacer(1, 2 * mm))

        # Risk gauge
        flow.append(_para("<b>Overall Risk Score</b>", self.styles["BodySm"]))
        flow.append(Spacer(1, 1.5 * mm))
        flow.append(_risk_gauge(score))
        flow.append(Spacer(1, 4 * mm))

        # PII distribution
        flow.append(_para("<b>PII Distribution by Category</b>", self.styles["BodySm"]))
        flow.append(Spacer(1, 1.5 * mm))
        if any(counts):
            flow.append(_pii_bar_chart(counts, labels))
        else:
            flow.append(_note("No data available - no PII categories contain findings."))
        flow.append(Spacer(1, 4 * mm))

        # Compliance
        flow.append(_para("<b>Compliance Overview</b>", self.styles["BodySm"]))
        flow.append(Spacer(1, 1.5 * mm))
        if items:
            flow.append(_compliance_donut(items))
        else:
            flow.append(_note("No data available - no compliance items were returned."))
        return flow

    def _footer_scan_details(self, flow):
        flow.append(_section_band("12. Scan Details", accent=SLATE_500))
        flow.append(Spacer(1, 2 * mm))
        rows = [
            ("Report ID", _para(self.report_id, self.styles["BodySm"])),
            ("Generated At", _para(self.generated_at, self.styles["BodySm"])),
            ("Document", _para(self.document.get("filename") or "—", self.styles["BodySm"])),
            ("Analyzed By", _para(self.document.get("user") or "—", self.styles["BodySm"])),
            ("Scan Timestamp", _para(_fmt_dt(self.document.get("scanned_at")), self.styles["BodySm"])),
            ("Report Scope", _para("OCR, PII, Risk, DLP Controls, Shadow AI, UEBA, Compliance", self.styles["BodySm"])),
        ]
        flow.append(_kv_table(rows))
        flow.append(Spacer(1, 3 * mm))
        flow.append(
            _para(
                "<i>This report is generated automatically by the OCR-Based DLP System. It is intended for "
                "authorized security personnel only and may contain sensitive information. Do not distribute "
                "without prior approval.</i>",
                self.styles["BodySm"],
            )
        )
        return flow

    # ------------------------------------------------------------------ build
    def build(self):
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=MARGIN_LR,
            rightMargin=MARGIN_LR,
            topMargin=MARGIN_TOP,
            bottomMargin=MARGIN_BOTTOM,
            title="Cybersecurity / DLP Assessment Report",
            author="OCR-Based DLP System",
            subject="Data Leak Prevention Assessment",
        )

        flow = []
        flow = self._executive_summary(flow)
        flow.append(Spacer(1, 4 * mm))
        flow = self._document_info(flow)
        flow.append(Spacer(1, 4 * mm))
        flow = self._ocr_results(flow)
        flow.append(Spacer(1, 4 * mm))
        flow = self._pii_table(flow)
        flow.append(Spacer(1, 4 * mm))
        flow = self._classification_section(flow)
        flow.append(Spacer(1, 4 * mm))
        flow = self._risk_analysis(flow)
        flow.append(Spacer(1, 4 * mm))
        flow = self._dlp_controls(flow)
        flow.append(Spacer(1, 4 * mm))
        flow = self._ai_behavior(flow)
        flow.append(Spacer(1, 4 * mm))
        flow = self._compliance(flow)
        flow.append(Spacer(1, 4 * mm))
        flow = self._recommendations(flow)
        flow.append(Spacer(1, 4 * mm))
        flow = self._charts_section(flow)
        flow.append(Spacer(1, 4 * mm))
        flow = self._footer_scan_details(flow)

        doc.build(
            flow,
            onFirstPage=_page_decoration(self.report_id, self.generated_at),
            onLaterPages=_page_decoration(self.report_id, self.generated_at),
            canvasmaker=NumberedCanvas,
        )
        buffer.seek(0)
        return buffer, self.report_id


def build_report_pdf(report):
    """Return (BytesIO, report_id) for the given analysis report dict."""
    builder = PDFReportBuilder(report)
    return builder.build()
