import { FaRobot } from 'react-icons/fa';
import { useDocumentAnalysis } from '../context/DocumentAnalysisContext';
import { Card, Spinner, StatusBadge, StatBox, ProgressBar, EmptyAnalysis, ModuleError } from './common/UI';

const SENSITIVE_PATTERNS = [
  { name: 'Email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/ },
  { name: 'Phone Number', regex: /\b\d{10}\b/ },
  { name: 'Aadhaar', regex: /\b\d{12}\b/ },
  { name: 'PAN', regex: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/ },
  { name: 'Credit Card', regex: /\b\d{16}\b/ },
];

function detectSensitiveData(text) {
  const found = [];
  SENSITIVE_PATTERNS.forEach(({ name, regex }) => {
    if (regex.test(String(text || ''))) found.push(name);
  });
  return found;
}

function ShadowAICard() {
  const { report, analyzing, currentStep } = useDocumentAnalysis();
  const shadowAi = report?.shadowAi;
  const ocrText = report?.ocr?.ok ? report?.ocr?.data?.extracted_text || '' : '';

  const detected = shadowAi?.ok && shadowAi.data?.shadow_ai_detected === true;
  const sensitive = shadowAi?.ok ? detectSensitiveData(ocrText) : [];
  const riskScore = detected ? 90 : sensitive.length ? 65 : 0;
  const unsafePrompt = detected || sensitive.length > 0;
  const recommendation = detected
    ? 'Blocked. This application is not an approved tool. Request access through IT or use the approved AI platform.'
    : sensitive.length
    ? 'Blocked. The prompt contains sensitive data. Remove personal information before using AI tools.'
    : 'Allowed. No shadow AI usage or sensitive data detected.';

  return (
    <Card title="Shadow AI Detection" subtitle="Shadow AI analysis for the last scanned document" icon={<FaRobot />}>
      {analyzing && !report && <Spinner label={currentStep || 'Analyzing document...'} />}

      {!analyzing && !report && <EmptyAnalysis message="No shadow AI analysis yet. Scan a document to run the Shadow AI module." />}

      {report && !shadowAi?.ok && <ModuleError message={shadowAi?.error || 'Shadow AI module failed.'} />}

      {report && shadowAi?.ok && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatBox label="Shadow AI" badge={<StatusBadge status={detected ? 'detected' : 'safe'} />} />
            <StatBox
              label="Sensitive Data"
              value={sensitive.length ? sensitive.join(', ') : 'None'}
              color={sensitive.length ? 'text-red-400' : 'text-green-400'}
            />
            <StatBox
              label="Detected At"
              value={shadowAi.data?.detected_at ? new Date(shadowAi.data.detected_at).toLocaleString() : '—'}
              color="text-gray-300"
            />
          </div>

          <ProgressBar label="AI Usage Risk Score" value={riskScore} />
          <p className="text-slate-500 text-xs -mt-2">Reflects unauthorized AI tool usage and sensitive prompt content — not the document's overall risk score (see Risk tab).</p>

          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
            <p className="text-indigo-300 text-xs mb-1">Recommendation</p>
            <p className="text-gray-200 text-sm break-words">{recommendation}</p>
          </div>

          <div
            className={`rounded-xl p-4 border ${
              unsafePrompt ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'
            }`}
          >
            <p className={`text-sm break-words ${unsafePrompt ? 'text-red-400' : 'text-green-400'}`}>{shadowAi.data?.message}</p>
          </div>
        </div>
      )}
    </Card>
  );
}

export default ShadowAICard;