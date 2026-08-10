import { useRef } from 'react';
import { FaPrint } from 'react-icons/fa';
import { useDocumentAnalysis } from '../context/DocumentAnalysisContext';
import { Card, Spinner, StatusBadge, StatBox, EmptyAnalysis, ModuleError } from './common/UI';

function PrintControlCard() {
  const { report, analyzing, currentStep, file } = useDocumentAnalysis();
  const printControl = report?.printControl;
  const iframeRef = useRef(null);

  const isAllowed = printControl?.data?.allowed === true;

  const handlePrint = () => {
    // Extra safety net: even if something tampers with the DOM and
    // "clicks" this handler, refuse to print unless explicitly allowed.
    if (!isAllowed || !file) return;

    const fileURL = URL.createObjectURL(file);
    const iframe = iframeRef.current;
    iframe.src = fileURL;
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      // release the blob a bit after the print dialog has had time to open
      setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
    };
  };

  return (
    <Card title="Print Control" subtitle="Print policy result for the last scanned document" icon={<FaPrint />}>
      {analyzing && !report && <Spinner label={currentStep || 'Analyzing document...'} />}

      {!analyzing && !report && <EmptyAnalysis message="No print check yet. Scan a document to run the print control module." />}

      {report && !printControl?.ok && <ModuleError message={printControl?.error || 'Print control module failed.'} />}

      {report && printControl?.ok && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatBox label="Permission" badge={<StatusBadge status={isAllowed ? 'allowed' : 'blocked'} />} />
            <StatBox label="Document Type" value={printControl.data?.input?.document_type} color="text-blue-400" className="capitalize" />
            <StatBox label="User Role" value={printControl.data?.input?.user_role} color="text-gray-300" className="capitalize" />
          </div>

          <div
            className={`rounded-xl p-4 border ${
              isAllowed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <p className={`text-sm break-words ${isAllowed ? 'text-green-400' : 'text-red-400'}`}>
              {printControl.data?.message}
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            disabled={!isAllowed}
            aria-disabled={!isAllowed}
            title={isAllowed ? 'Print this document' : 'Printing is blocked for this document'}
            className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-colors ${
              isAllowed
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60 pointer-events-none'
            }`}
          >
            <FaPrint />
            {isAllowed ? 'Print Document' : 'Print Blocked'}
          </button>

          {isAllowed && (
            <p className="text-gray-500 text-xs">This document may be printed normally.</p>
          )}
          {!isAllowed && (
            <p className="text-gray-500 text-xs">Printing is restricted. Authorized users must request an exception.</p>
          )}

          {/* Hidden iframe used to render + trigger the browser print dialog for the actual file */}
          <iframe ref={iframeRef} title="print-frame" style={{ display: 'none' }} />
        </div>
      )}
    </Card>
  );
}

export default PrintControlCard;