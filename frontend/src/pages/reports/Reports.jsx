import { useState } from 'react';
import { Link } from 'react-router-dom';
import { reports, audit } from '../../services/api';
import { useDocumentAnalysis } from '../../context/DocumentAnalysisContext';
import { useAuth } from '../../context/AuthContext';

function triggerDownload(blob, filename) {
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(downloadUrl);
  document.body.removeChild(a);
}

function ReportsPage() {
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const { report } = useDocumentAnalysis();
  const { user } = useAuth();

  const downloadPDF = async () => {
    if (!report) {
      alert('No analysis available. Run Analyze Document on the OCR page first.');
      return;
    }
    setLoadingPDF(true);
    try {
      const response = await reports.generatePDF(report);
      const blob = await response.blob();
      const filename = `dlp-assessment-${report.document.filename.replace(/\.[^.]+$/, '') || 'document'}.pdf`;
      triggerDownload(blob, filename);
      audit.log(user?.email, 'REPORT_EXPORTED', `Downloaded PDF report for "${report.document.filename}"`);
    } catch (err) {
      alert(`PDF generation failed: ${err.message}`);
    } finally {
      setLoadingPDF(false);
    }
  };

  const downloadCSV = async () => {
    if (!report) {
      alert('No analysis available. Run Analyze Document on the OCR page first.');
      return;
    }
    setLoadingCSV(true);
    try {
      const response = await reports.generateCSV(report);
      const blob = await response.blob();
      const filename = `dlp-assessment-${report.document.filename.replace(/\.[^.]+$/, '') || 'document'}.csv`;
      triggerDownload(blob, filename);
      audit.log(user?.email, 'REPORT_EXPORTED', `Downloaded CSV report for "${report.document.filename}"`);
    } catch (err) {
      alert(`CSV generation failed: ${err.message}`);
    } finally {
      setLoadingCSV(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen p-4 sm:p-6 lg:p-8">
      <h1 className="font-display text-white text-2xl md:text-3xl font-semibold mb-2">Reports</h1>
      <p className="text-gray-400 mb-8">
        Generate formatted security assessment reports from the most recent document analysis.
      </p>

      {report && (
        <div className="dli-panel p-5 border-indigo-500/20 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="min-w-0">
              <p className="text-white font-semibold break-words">{report.document.filename}</p>
              <p className="text-gray-500 text-sm">
                Risk: <span className="text-white">{report.risk.risk_level}</span> &middot; Score:{' '}
                {report.risk.risk_score} &middot; {new Date(report.document.scanned_at).toLocaleString()}
              </p>
            </div>
            <Link to="/ocr" className="text-indigo-400 hover:text-indigo-300 text-sm">
              Run new analysis &rarr;
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="dli-panel p-6 border-green-500/20 hover:scale-[1.02] transition-transform duration-300">
          <h2 className="text-white text-xl font-bold mb-2">CSV Report</h2>
          <p className="text-gray-400 text-sm mb-4">
            Structured spreadsheet with document info, risk summary, PII detections per category, DLP control results,
            AI &amp; behavior, compliance and recommendations.
          </p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-600 text-sm">Format: .csv</span>
            <button onClick={downloadCSV} disabled={loadingCSV || !report}
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm">
              {loadingCSV ? 'Generating...' : 'Download'}
            </button>
          </div>
          {!report && (
            <p className="text-amber-400/80 text-xs mt-3">
              Run Analyze Document on the OCR page to enable CSV report generation.
            </p>
          )}
        </div>
        <div className="dli-panel p-6 border-red-500/20 hover:scale-[1.02] transition-transform duration-300">
          <h2 className="text-white text-xl font-bold mb-2">PDF Assessment Report</h2>
          <p className="text-gray-400 text-sm mb-4">
            Enterprise-grade multi-page Cybersecurity / DLP assessment: executive summary, PII table, risk analysis,
            DLP controls, compliance and charts.
          </p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-600 text-sm">Format: .pdf</span>
            <button onClick={downloadPDF} disabled={loadingPDF}
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm">
              {loadingPDF ? 'Generating...' : 'Download'}
            </button>
          </div>
          {!report && (
            <p className="text-amber-400/80 text-xs mt-3">
              Run Analyze Document on the OCR page to enable PDF report generation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
