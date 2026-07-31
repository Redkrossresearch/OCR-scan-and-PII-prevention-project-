import { FaEnvelope } from 'react-icons/fa';
import { useDocumentAnalysis } from '../context/DocumentAnalysisContext';
import { Card, Spinner, StatusBadge, StatBox, EmptyAnalysis, ModuleError } from './common/UI';

const RISK_SCORE = { Low: 20, Medium: 55, High: 90 };

function EmailDLPCard() {
  const { report, analyzing, currentStep } = useDocumentAnalysis();
  const emailDlp = report?.emailDlp;

  return (
    <Card title="Email DLP" subtitle="Email DLP result for the last scanned document" icon={<FaEnvelope />}>
      {analyzing && !report && <Spinner label={currentStep || 'Analyzing document...'} />}

      {!analyzing && !report && <EmptyAnalysis message="No email scan yet. Scan a document to run the email DLP module." />}

      {report && !emailDlp?.ok && <ModuleError message={emailDlp?.error || 'Email DLP module failed.'} />}

      {report && emailDlp?.ok && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-white font-medium">{emailDlp.data?.subject || emailDlp.data?.input?.subject}</p>
              <p className="text-gray-500 text-sm">
                {emailDlp.data?.input?.sender || emailDlp.data?.sender} → {emailDlp.data?.input?.receiver || emailDlp.data?.receiver}
              </p>
            </div>
            <StatusBadge
              status={emailDlp.data?.sensitive_data_found === true || emailDlp.data?.risk_level === 'High' ? 'blocked' : 'allowed'}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatBox label="Risk Level" badge={<StatusBadge status={emailDlp.data?.risk_level} />} />
            <StatBox
              label="Sensitive Data"
              value={emailDlp.data?.detected_types?.length || 0}
              color={emailDlp.data?.detected_types?.length ? 'text-red-400' : 'text-green-400'}
            />
            <StatBox
              label="Risk Score"
              value={`${RISK_SCORE[emailDlp.data?.risk_level] ?? 0}%`}
              color={(RISK_SCORE[emailDlp.data?.risk_level] ?? 0) > 70 ? 'text-red-400' : (RISK_SCORE[emailDlp.data?.risk_level] ?? 0) > 40 ? 'text-amber-400' : 'text-green-400'}
            />
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Detected Sensitive Types</p>
            <p className="text-white text-sm">
              {emailDlp.data?.detected_types?.length
                ? emailDlp.data.detected_types.map((t) => t.toUpperCase()).join(', ')
                : 'None found'}
            </p>
          </div>

          <p className="text-gray-500 text-xs">{emailDlp.data?.message}</p>
        </div>
      )}
    </Card>
  );
}

export default EmailDLPCard;
