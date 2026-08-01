import { FaClipboardCheck } from 'react-icons/fa';
import { useDocumentAnalysis } from '../context/DocumentAnalysisContext';
import { Card, Spinner, StatusBadge, StatBox, EmptyAnalysis, ModuleError } from './common/UI';

function ClipboardCard() {
  const { report, analyzing, currentStep } = useDocumentAnalysis();
  const clipboard = report?.clipboard;

  const sensitiveData = clipboard?.data?.reason?.includes('Sensitive data detected')
    ? clipboard.data.reason.split('Sensitive data detected:')[1]?.trim() || 'Yes'
    : clipboard?.data?.blocked
    ? 'Yes'
    : 'None found';

  const riskScore = clipboard?.data?.blocked ? 85 : 10;

  return (
    <Card title="Clipboard Control" subtitle="Clipboard scan result for the last scanned document" icon={<FaClipboardCheck />}>
      {analyzing && !report && <Spinner label={currentStep || 'Analyzing document...'} />}

      {!analyzing && !report && <EmptyAnalysis message="No clipboard scan yet. Scan a document to run the clipboard module." />}

      {report && !clipboard?.ok && <ModuleError message={clipboard?.error || 'Clipboard module failed.'} />}

      {report && clipboard?.ok && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatBox
              label="Sensitive Data"
              value={clipboard.data?.blocked ? 'Detected' : 'None'}
              color={clipboard.data?.blocked ? 'text-red-400' : 'text-green-400'}
            />
            <StatBox
              label="Risk Score"
              value={`${riskScore}%`}
              color={riskScore > 70 ? 'text-red-400' : 'text-green-400'}
            />
            <StatBox label="Verdict" badge={<StatusBadge status={clipboard.data?.blocked ? 'blocked' : 'allowed'} />} />
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Sensitive Data Details</p>
            <p className="text-white text-sm break-words">{sensitiveData}</p>
          </div>

          <div
            className={`rounded-xl p-4 border ${
              clipboard.data?.blocked ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'
            }`}
          >
            <p className={`text-sm break-words ${clipboard.data?.blocked ? 'text-red-400' : 'text-green-400'}`}>{clipboard.data?.reason}</p>
          </div>
        </div>
      )}
    </Card>
  );
}

export default ClipboardCard;
