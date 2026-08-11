import { Link } from 'react-router-dom';
import { useDocumentAnalysis } from '../../context/DocumentAnalysisContext';


import ClipboardCard from '../../components/ClipboardCard';
import PrintControlCard from '../../components/PrintControlCard';


function DLPControlsPage() {
  const { report, analyzing } = useDocumentAnalysis();

  return (
    <div className="bg-slate-950 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <h1 className="font-display text-white text-2xl md:text-3xl font-semibold">DLP Controls</h1>
        <Link
          to="/ocr"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Scan New Document
        </Link>
      </div>
      <p className="text-gray-400 mb-8 break-words">
        {report
          ? `Showing DLP results for "${report.document.filename}" (${new Date(report.document.scanned_at).toLocaleString()})`
          : analyzing
          ? 'A document analysis is currently in progress...'
          : 'No document analyzed yet. Scan a document from the OCR Scanner page to view DLP results.'}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       
        <ClipboardCard />
        <PrintControlCard />
        
      </div>
    </div>
  );
}

export default DLPControlsPage;
