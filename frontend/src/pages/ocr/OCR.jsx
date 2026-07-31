import { useState, useRef } from 'react';
import { ocr, reports, audit } from '../../services/api';
import { useDocumentAnalysis } from '../../context/DocumentAnalysisContext';
import { useAuth } from '../../context/AuthContext';
import SecurityReport from '../../components/report/SecurityReport';

function OCRPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
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
    try {
      const data = await ocr.extractText(file);
      setResult(data);
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
      await runAnalysis(file);
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

  const copyText = () => {
    if (result?.extracted_text) {
      navigator.clipboard.writeText(result.extracted_text);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-slate-950 min-h-screen p-8">
      <h1 className="text-white text-4xl font-bold mb-2">OCR Scanner & Document Analysis</h1>
      <p className="text-gray-400 mb-8">
        Upload a document once. It will be scanned through OCR, PII detection, risk analysis and all DLP modules automatically.
      </p>
      <div className="max-w-4xl">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-6">
          <label className="block text-gray-400 text-sm mb-3">Select a file (PDF, PNG, JPG)</label>
          <div className="flex flex-wrap gap-3">
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileSelect}
              className="flex-1 min-w-60 bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer" />
            <button onClick={handleExtract} disabled={!file || loading || analyzing}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50">
              {loading ? 'Extracting...' : 'Extract Text'}
            </button>
            <button onClick={handleAnalyze} disabled={!file || analyzing}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50">
              {analyzing ? 'Analyzing...' : 'Analyze Document'}
            </button>
          </div>
          {file && (
            <p className="text-gray-500 text-sm mt-3">
              {file.name} ({formatSize(file.size)}) — will run the full security pipeline
            </p>
          )}
        </div>

        {(analyzing || analysisError) && (
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-6">
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
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        )}

        {error && !analyzing && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">{error}</div>
        )}

        {result && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mb-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h2 className="text-white font-bold">Extracted Text</h2>
                <p className="text-gray-500 text-sm">{result.filename} ({result.file_type?.toUpperCase()})</p>
              </div>
              <button onClick={copyText}
                className="bg-slate-800 hover:bg-slate-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors">
                Copy
              </button>
            </div>
            <div className="p-6">
              <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
                {result.extracted_text || 'No text could be extracted.'}
              </pre>
            </div>
          </div>
        )}

        {report && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-white text-2xl font-bold">Final Security Report</h2>
                <p className="text-gray-500 text-sm">{report.document.filename} — {new Date(report.document.scanned_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold bg-slate-800/60 border-slate-700/60 text-gray-300">
                  Scanned by {report.document.user}
                </span>
                <button onClick={handleDownloadPdf} disabled={pdfLoading}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {pdfLoading ? 'Generating...' : 'Download PDF Report'}
                </button>
              </div>
            </div>
            <SecurityReport report={report} />
          </div>
        )}
      </div>
    </div>
  );
}

export default OCRPage;
