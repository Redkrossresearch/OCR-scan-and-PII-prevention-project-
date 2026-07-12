import { useState } from 'react';
import { reports } from '../../services/api';

function ReportsPage() {
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const downloadFile = async (url, filename, setLoading) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen p-8">
      <h1 className="text-white text-4xl font-bold mb-8">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-slate-900 rounded-2xl p-6 border border-green-500/20 hover:scale-105 transition-all duration-300 shadow-lg">
          <h2 className="text-white text-xl font-bold mb-2">CSV Report</h2>
          <p className="text-gray-400 text-sm mb-4">Download spreadsheet with scan data, PII detections, and risk assessments.</p>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Format: .csv</span>
            <button onClick={() => downloadFile(reports.downloadCSV(), 'report.csv', setLoadingCSV)} disabled={loadingCSV}
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm">
              {loadingCSV ? 'Generating...' : 'Download'}
            </button>
          </div>
        </div>
        <div className="bg-slate-900 rounded-2xl p-6 border border-red-500/20 hover:scale-105 transition-all duration-300 shadow-lg">
          <h2 className="text-white text-xl font-bold mb-2">PDF Report</h2>
          <p className="text-gray-400 text-sm mb-4">Download formatted PDF report suitable for sharing with stakeholders.</p>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Format: .pdf</span>
            <button onClick={() => downloadFile(reports.downloadPDF(), 'report.pdf', setLoadingPDF)} disabled={loadingPDF}
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm">
              {loadingPDF ? 'Generating...' : 'Download'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
