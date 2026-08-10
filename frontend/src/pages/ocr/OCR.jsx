import { useState, useRef } from 'react';
import { ocr, reports, audit, clipboard as clipboardApi } from '../../services/api';
import { useDocumentAnalysis } from '../../context/DocumentAnalysisContext';
import { useAuth } from '../../context/AuthContext';
import SecurityReport from '../../components/report/SecurityReport';

function OCRPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [clipboardCheck, setClipboardCheck] = useState(null);
  const [userRole, setUserRole] = useState('employee');
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const fileRef = useRef();

  const { report, analyzing, progress, currentStep, error: analysisError, runAnalysis } = useDocumentAnalysis();
  const { user } = useAuth();

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    setClipboardCheck(null);
    try {
      const data = await ocr.extractText(file);
      setResult(data);
      if (data?.extracted_text) {
        try {
          const verdict = await clipboardApi.check({ user: user?.email || 'user', content: data.extracted_text });
          setClipboardCheck(verdict);
        } catch {
          // If the clipboard check itself fails, default to blocked — fail safe, not open.
          setClipboardCheck({ blocked: true, reason: 'Clipboard policy check failed — copy disabled as a precaution.' });
        }
      }
    } catch (err) {
      setError(err.message || 'OCR extraction failed');
    } finally {
      setLoading(false);
    }
  };

const handleAnalyze = async () => {
    if (!file) return;
    setError('');
    try {
      await runAnalysis(file, userRole);
    } catch (err) {
      setError(err.message || 'Document analysis failed');
    }
  };

  const handleDownloadPdf = async () => {
    if (!report) return;
    setPdfLoading(true);
    setError('');
    try {
      const response = await reports.generatePDF(report);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `dlp-assessment-${report.document.filename.replace(/\.[^.]+$/, '') || 'document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      audit.log(user?.email, 'REPORT_EXPORTED', `Downloaded PDF report for "${report.document.filename}" from OCR page`);
    } catch (err) {
      setError(err.message || 'PDF download failed');
    } finally {
      setPdfLoading(false);
    }
  };

  const isClipboardBlocked = clipboardCheck?.blocked === true;

  const copyText = () => {
    if (isClipboardBlocked || !result?.extracted_text) return;
    navigator.clipboard.writeText(result.extracted_text);
  };

  const handleTextCopyAttempt = (e) => {
    if (isClipboardBlocked) {
      // Refuse the actual browser copy event — this is what stops manual
      // select + Ctrl+C from landing anything on the OS clipboard at all.
      e.preventDefault();
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-slate-950 min-h-screen p-4 sm:p-6 lg:p-8">
      <h1 className="font-display text-white text-2xl md:text-3xl font-semibold mb-2">OCR Scanner &amp; Document Analysis</h1>
      <p className="text-gray-400 mb-8">
        Upload a document once. It will be scanned through OCR, PII detection, risk analysis and all DLP modules automatically.
      </p>
      <div>
        <div className="dli-panel p-5 md:p-6 mb-6">
          <label className="block text-gray-400 text-sm mb-3">Select a file (PDF, PNG, JPG)</label>
          <div className="mb-3">
            <label className="text-gray-500 text-xs block mb-1.5">Your Role (used for Print / USB / Encryption authorization)</label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
              <option value="compliance officer">Compliance Officer</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileSelect}
              className="flex-1 min-w-60 bg-slate-800/70 border border-slate-700/70 text-white rounded-xl px-4 py-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:cursor-pointer" />
            <button onClick={handleExtract} disabled={!file || loading || analyzing}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50">
              {loading ? 'Extracting...' : 'Extract Text'}
            </button>
            <button onClick={handleAnalyze} disabled={!file || analyzing}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50">
              {analyzing ? 'Analyzing...' : 'Analyze Document'}
            </button>
          </div>
          {file && (
            <p className="text-gray-500 text-sm mt-3 break-words">
              {file.name} ({formatSize(file.size)}) — will run the full security pipeline
            </p>
          )}
        </div>

        {(analyzing || analysisError) && (
          <div className="dli-panel p-5 md:p-6 mb-6">
            {analysisError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4">{analysisError}</div>
            )}
            {analyzing && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">{currentStep || 'Analyzing...'}</span>
                  <span className="text-white font-semibold">{progress}%</span>
                </div>
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        )}

        {error && !analyzing && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">{error}</div>
        )}

        {result && (
          <div className="dli-panel overflow-hidden mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-800">
              <div className="min-w-0">
                <h2 className="text-white font-bold">Extracted Text</h2>
                <p className="text-gray-500 text-sm truncate max-w-full">{result.filename} ({result.file_type?.toUpperCase()})</p>
              </div>
              <button
                onClick={copyText}
                disabled={isClipboardBlocked || !result.extracted_text}
                title={isClipboardBlocked ? 'Copying is blocked — sensitive data detected' : 'Copy extracted text'}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  isClipboardBlocked || !result.extracted_text
                    ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed opacity-60 pointer-events-none'
                    : 'bg-slate-800 hover:bg-slate-700 text-gray-300 cursor-pointer'
                }`}
              >
                {isClipboardBlocked ? 'Copy Blocked' : 'Copy'}
              </button>
            </div>
            {clipboardCheck && (
              <div
                className={`mx-5 md:mx-6 mt-4 rounded-xl p-3 border text-sm ${
                  isClipboardBlocked ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'
                }`}
              >
                {clipboardCheck.reason}
              </div>
            )}
            <div className="p-5 md:p-6">
              <pre
                onCopy={handleTextCopyAttempt}
                onCut={handleTextCopyAttempt}
                className={`text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto bg-slate-800/40 border border-slate-800 rounded-xl p-4 ${
                  isClipboardBlocked ? 'select-none' : ''
                }`}
              >
                {result.extracted_text || 'No text could be extracted.'}
              </pre>
              {isClipboardBlocked && (
                <p className="text-gray-500 text-xs mt-2">
                  This document contains sensitive data — selecting and copying this text is disabled.
                </p>
              )}
            </div>
          </div>
        )}

        {report && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="min-w-0">
                <h2 className="text-white text-xl md:text-2xl font-bold">Final Security Report</h2>
                <p className="text-gray-500 text-sm break-words">{report.document.filename} — {new Date(report.document.scanned_at).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold bg-slate-800/60 border-slate-700/60 text-gray-300">
                  Scanned by {report.document.user}
                </span>
                <button onClick={handleDownloadPdf} disabled={pdfLoading}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {pdfLoading ? 'Generating...' : 'Download PDF Report'}
                </button>
              </div>
            </div>
            <SecurityReport report={report} file={file} />
          </div>
        )}
      </div>
    </div>
  );
}

export default OCRPage;