import { Link } from 'react-router-dom';
import { useDocumentAnalysis } from '../../context/DocumentAnalysisContext';
import PolicyAlertsCard from '../../components/PolicyAlertsCard';
import EmailDLPCard from '../../components/EmailDLPCard';
import ClipboardCard from '../../components/ClipboardCard';
import PrintControlCard from '../../components/PrintControlCard';
import USBControlCard from '../../components/USBControlCard';
import FileTypeBlockingCard from '../../components/FileTypeBlockingCard';

function DLPControlsPage() {
  const { report, analyzing } = useDocumentAnalysis();

  return (
    <div className="bg-slate-950 min-h-screen p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <h1 className="text-white text-4xl font-bold">DLP Controls</h1>
        <Link
          to="/ocr"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Scan New Document
        </Link>
      </div>
      <p className="text-gray-400 mb-8">
        {report
          ? `Showing DLP results for "${report.document.filename}" (${new Date(report.document.scanned_at).toLocaleString()})`
          : analyzing
          ? 'A document analysis is currently in progress...'
          : 'No document analyzed yet. Scan a document from the OCR Scanner page to view DLP results.'}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PolicyAlertsCard />
        <EmailDLPCard />
        <ClipboardCard />
        <PrintControlCard />
        <USBControlCard />
        <FileTypeBlockingCard />
      </div>
    </div>
  );
}

export default DLPControlsPage;
