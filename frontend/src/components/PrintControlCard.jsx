import { FaPrint } from 'react-icons/fa';
import { useDocumentAnalysis } from '../context/DocumentAnalysisContext';
import { Card, Spinner, StatusBadge, StatBox, EmptyAnalysis, ModuleError } from './common/UI';

function PrintControlCard() {
  const { report, analyzing, currentStep } = useDocumentAnalysis();
  const printControl = report?.printControl;

  return (
    <Card title="Print Control" subtitle="Print policy result for the last scanned document" icon={<FaPrint />}>
      {analyzing && !report && <Spinner label={currentStep || 'Analyzing document...'} />}

      {!analyzing && !report && <EmptyAnalysis message="No print check yet. Scan a document to run the print control module." />}

      {report && !printControl?.ok && <ModuleError message={printControl?.error || 'Print control module failed.'} />}

      {report && printControl?.ok && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatBox label="Permission" badge={<StatusBadge status={printControl.data?.allowed ? 'allowed' : 'blocked'} />} />
            <StatBox label="Document Type" value={printControl.data?.input?.document_type} color="text-blue-400" className="capitalize" />
            <StatBox label="User Role" value={printControl.data?.input?.user_role} color="text-gray-300" className="capitalize" />
          </div>

          <div
            className={`rounded-xl p-4 border ${
              printControl.data?.allowed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <p className={`text-sm break-words ${printControl.data?.allowed ? 'text-green-400' : 'text-red-400'}`}>
              {printControl.data?.message}
            </p>
          </div>

          {printControl.data?.allowed && (
            <p className="text-gray-500 text-xs">This document may be printed normally.</p>
          )}
          {printControl.data?.allowed === false && (
            <p className="text-gray-500 text-xs">Printing is restricted. Authorized users must request an exception.</p>
          )}
        </div>
      )}
    </Card>
  );
}

export default PrintControlCard;
