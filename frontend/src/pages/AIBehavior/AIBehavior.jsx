import { Link } from 'react-router-dom';
import { useDocumentAnalysis } from '../../context/DocumentAnalysisContext';
import ShadowAICard from '../../components/ShadowAICard';
import UEBACard from '../../components/UEBACard';

function AIBehaviorPage() {
  const { report, analyzing } = useDocumentAnalysis();

  return (
    <div className="bg-slate-950 min-h-screen p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <h1 className="text-white text-4xl font-bold">AI & Behavior</h1>
        <Link
          to="/ocr"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Scan New Document
        </Link>
      </div>
      <p className="text-gray-400 mb-8">
        {report
          ? `Showing AI & behavior analysis for "${report.document.filename}"`
          : analyzing
          ? 'A document analysis is currently in progress...'
          : 'No document analyzed yet. Scan a document from the OCR Scanner page to view AI & behavior analysis.'}
      </p>
      <div className="grid grid-cols-1 gap-6">
        <ShadowAICard />
        <UEBACard />
      </div>
    </div>
  );
}

export default AIBehaviorPage;
