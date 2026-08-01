import {
  FaFileAlt,
  FaSearch,
  FaShieldAlt,
  FaExclamationTriangle,
  FaBell,
  FaEnvelope,
  FaClipboardCheck,
  FaPrint,
  FaUsb,
  FaFileContract,
  FaRobot,
  FaChartLine,
  FaBalanceScale,
  FaListAlt,
} from 'react-icons/fa';
import { StatusBadge, ProgressBar, StatBox, ModuleError } from '../common/UI';

const PII_COUNTS = [
  { key: 'emails', label: 'Emails', color: 'text-blue-400' },
  { key: 'phone_numbers', label: 'Phones', color: 'text-green-400' },
  { key: 'aadhaar_numbers', label: 'Aadhaar', color: 'text-purple-400' },
  { key: 'pan_numbers', label: 'PAN', color: 'text-amber-400' },
  { key: 'passport_numbers', label: 'Passports', color: 'text-cyan-400' },
  { key: 'credit_cards', label: 'Credit Cards', color: 'text-red-400' },
  { key: 'ssn_numbers', label: 'SSN', color: 'text-pink-400' },
];

function Section({ icon, title, children }) {
  return (
    <div className="dli-panel p-5 md:p-6">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-800/60">
        <span className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-base">
          {icon}
        </span>
        <h2 className="text-white text-base md:text-lg font-semibold truncate">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function DocumentSection({ document }) {
  const size = document.size < 1024 * 1024
    ? `${(document.size / 1024).toFixed(1)} KB`
    : `${(document.size / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <Section icon={<FaFileAlt />} title="Document Information">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatBox label="Filename" value={document.filename} color="text-indigo-300" className="col-span-2 md:col-span-1" />
        <StatBox label="Size" value={size} color="text-gray-300" />
        <StatBox label="Type" value={document.extension ? `.${document.extension}` : 'Unknown'} color="text-gray-300" />
        <StatBox label="Scanned By" value={document.user} color="text-gray-300" />
        <StatBox label="Scanned At" value={new Date(document.scanned_at).toLocaleString()} color="text-gray-300" className="col-span-2 md:col-span-1" />
        <StatBox label="Upload" value={document.upload?.message || '—'} color="text-green-400" className="col-span-2 md:col-span-1" />
      </div>
    </Section>
  );
}

function OCRSection({ ocr }) {
  if (!ocr.ok) return <Section icon={<FaSearch />} title="OCR Results"><ModuleError message={ocr.error} /></Section>;
  const text = ocr.data?.extracted_text || 'No text could be extracted.';
  return (
    <Section icon={<FaSearch />} title="OCR Results">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="text-white font-medium truncate max-w-full">{ocr.data?.filename}</p>
          <p className="text-gray-500 text-sm">Type: {String(ocr.data?.file_type || '').toUpperCase()}</p>
        </div>
        <StatusBadge status={text.length > 0 ? 'allowed' : 'unsupported'} />
      </div>
      <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-56 overflow-y-auto bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
        {text}
      </pre>
    </Section>
  );
}

function PIISection({ pii }) {
  if (!pii.ok) return <Section icon={<FaShieldAlt />} title="PII Detection"><ModuleError message={pii.error} /></Section>;
  return (
    <Section icon={<FaShieldAlt />} title="PII Detection">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {PII_COUNTS.map((item) => (
          <StatBox
            key={item.key}
            label={item.label}
            value={Array.isArray(pii.data[item.key]) ? pii.data[item.key].length : 0}
            color={pii.data[item.key]?.length ? item.color : 'text-gray-500'}
          />
        ))}
      </div>
      {Array.isArray(pii.data.keywords) && pii.data.keywords.length > 0 && (
        <div>
          <p className="text-gray-400 text-sm mb-2">Keywords Detected</p>
          <div className="flex flex-wrap gap-2">
            {pii.data.keywords.map((kw, i) => (
              <span key={i} className="bg-slate-800 text-gray-300 px-3 py-1 rounded-lg text-sm">{kw}</span>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

function RiskSection({ risk }) {
  if (!risk.ok) return <Section icon={<FaExclamationTriangle />} title="Risk Analysis"><ModuleError message="Risk analysis failed" /></Section>;
  const scoreColor = risk.risk_score > 70 ? 'text-red-400' : risk.risk_score > 40 ? 'text-amber-400' : 'text-green-400';
  const access = risk.access?.ok ? risk.access.data : null;
  return (
    <Section icon={<FaExclamationTriangle />} title="Risk Analysis">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatBox label="Risk Score" value={risk.risk_score} color={scoreColor} />
        <StatBox label="Risk Level" badge={<StatusBadge status={risk.risk_level} />} />
        <StatBox label="Classification" value={risk.classification} color="text-blue-400" />
        <StatBox label="Access" badge={<StatusBadge status={access?.access === 'Granted' ? 'allowed' : 'blocked'} />} />
      </div>
      <ProgressBar label="Risk Score" value={risk.risk_score} />
      {access && <p className="text-gray-400 text-sm mt-3 break-words">Role: {access.role} — {access.access} for {access.risk_level} risk documents</p>}
    </Section>
  );
}

function PolicyAlertSection({ policyAlert }) {
  if (!policyAlert.ok) return <Section icon={<FaBell />} title="Policy Alerts"><ModuleError message={policyAlert.error} /></Section>;
  const alert = policyAlert.data?.alert || policyAlert.data;
  return (
    <Section icon={<FaBell />} title="Policy Alerts">
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-white font-semibold">{alert?.policy_name}</p>
          <div className="flex gap-2">
            <StatusBadge status={alert?.severity} />
            <StatusBadge status="active" />
          </div>
        </div>
        <p className="text-gray-300 text-sm">{alert?.description}</p>
        <p className="text-gray-500 text-xs">{policyAlert.data?.message}</p>
      </div>
    </Section>
  );
}

function EmailDLPSection({ emailDlp }) {
  if (!emailDlp.ok) return <Section icon={<FaEnvelope />} title="Email DLP Results"><ModuleError message={emailDlp.error} /></Section>;
  const d = emailDlp.data;
  const blocked = d?.sensitive_data_found === true || d?.risk_level === 'High';
  return (
    <Section icon={<FaEnvelope />} title="Email DLP Results">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="text-white font-medium truncate max-w-full">{d?.subject || d?.input?.subject}</p>
          <p className="text-gray-500 text-sm truncate max-w-full">
            {d?.input?.sender} → {d?.input?.receiver}
          </p>
        </div>
        <StatusBadge status={blocked ? 'blocked' : 'allowed'} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatBox label="Risk Level" badge={<StatusBadge status={d?.risk_level} />} />
        <StatBox label="Sensitive Data" value={d?.detected_types?.length || 0} color={d?.detected_types?.length ? 'text-red-400' : 'text-green-400'} />
        <StatBox
          label="Detected Types"
          value={d?.detected_types?.length ? d.detected_types.map((t) => t.toUpperCase()).join(', ') : 'None'}
          color="text-gray-300"
          className="col-span-2 md:col-span-1"
        />
      </div>
      <p className="text-gray-400 text-sm mt-3 break-words">{d?.message}</p>
    </Section>
  );
}

function ClipboardSection({ clipboard }) {
  if (!clipboard.ok) return <Section icon={<FaClipboardCheck />} title="Clipboard Analysis"><ModuleError message={clipboard.error} /></Section>;
  return (
    <Section icon={<FaClipboardCheck />} title="Clipboard Analysis">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <StatBox label="Verdict" badge={<StatusBadge status={clipboard.data?.blocked ? 'blocked' : 'allowed'} />} />
        <StatBox label="Risk Score" value={clipboard.data?.blocked ? '85%' : '10%'} color={clipboard.data?.blocked ? 'text-red-400' : 'text-green-400'} />
        <StatBox label="Sensitive Data" value={clipboard.data?.blocked ? 'Detected' : 'None'} color={clipboard.data?.blocked ? 'text-red-400' : 'text-green-400'} />
      </div>
      <div className={`rounded-xl p-4 border ${clipboard.data?.blocked ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
        <p className={`text-sm break-words ${clipboard.data?.blocked ? 'text-red-400' : 'text-green-400'}`}>{clipboard.data?.reason}</p>
      </div>
    </Section>
  );
}

function PrintSection({ printControl }) {
  if (!printControl.ok) return <Section icon={<FaPrint />} title="Print Policy Result"><ModuleError message={printControl.error} /></Section>;
  return (
    <Section icon={<FaPrint />} title="Print Policy Result">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <StatBox label="Permission" badge={<StatusBadge status={printControl.data?.allowed ? 'allowed' : 'blocked'} />} />
        <StatBox label="Document Type" value={printControl.data?.input?.document_type} color="text-blue-400" className="capitalize" />
        <StatBox label="User Role" value={printControl.data?.input?.user_role} color="text-gray-300" className="capitalize" />
      </div>
      <div className={`rounded-xl p-4 border ${printControl.data?.allowed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
        <p className={`text-sm break-words ${printControl.data?.allowed ? 'text-green-400' : 'text-red-400'}`}>{printControl.data?.message}</p>
      </div>
    </Section>
  );
}

function USBSection({ usbControl }) {
  if (!usbControl.ok) return <Section icon={<FaUsb />} title="USB Policy Result"><ModuleError message={usbControl.error} /></Section>;
  return (
    <Section icon={<FaUsb />} title="USB Policy Result">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <StatBox label="USB Access" badge={<StatusBadge status={usbControl.data?.usb_allowed ? 'allowed' : 'blocked'} />} />
        <StatBox label="Status" badge={<StatusBadge status={usbControl.data?.usb_allowed ? 'enabled' : 'disabled'} />} />
        <StatBox label="Device" value={usbControl.data?.input?.device_name} color="text-blue-400" />
      </div>
      <div className={`rounded-xl p-4 border ${usbControl.data?.usb_allowed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
        <p className={`text-sm break-words ${usbControl.data?.usb_allowed ? 'text-green-400' : 'text-red-400'}`}>{usbControl.data?.message}</p>
      </div>
    </Section>
  );
}

function FileTypeSection({ fileType }) {
  if (!fileType.ok) return <Section icon={<FaFileContract />} title="File Type Validation"><ModuleError message={fileType.error} /></Section>;
  const extension = String(fileType.data?.input?.filename || '').split('.').pop().toLowerCase();
  const status = fileType.data?.allowed ? 'allowed' : extension ? 'blocked' : 'unsupported';
  return (
    <Section icon={<FaFileContract />} title="File Type Validation">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <StatBox label="Verdict" badge={<StatusBadge status={status} />} />
        <StatBox label="Extension" value={extension ? `.${extension}` : 'None'} color="text-blue-400" />
        <StatBox label="Filename" value={fileType.data?.input?.filename} color="text-gray-300" />
      </div>
      <div className={`rounded-xl p-4 border ${status === 'allowed' ? 'bg-green-500/10 border-green-500/30' : status === 'blocked' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
        <p className={`text-sm break-words ${status === 'allowed' ? 'text-green-400' : status === 'blocked' ? 'text-red-400' : 'text-amber-400'}`}>
          {fileType.data?.message}
        </p>
      </div>
    </Section>
  );
}

function ShadowAISection({ shadowAi, ocr }) {
  if (!shadowAi.ok) return <Section icon={<FaRobot />} title="Shadow AI Analysis"><ModuleError message={shadowAi.error} /></Section>;
  const detected = shadowAi.data?.shadow_ai_detected === true;
  const text = ocr?.ok ? ocr.data?.extracted_text || '' : '';
  const sensitivePatterns = [
    { name: 'Email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/ },
    { name: 'Phone', regex: /\b\d{10}\b/ },
    { name: 'Aadhaar', regex: /\b\d{12}\b/ },
    { name: 'PAN', regex: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/ },
    { name: 'Credit Card', regex: /\b\d{16}\b/ },
  ];
  const sensitive = sensitivePatterns.filter(({ regex }) => regex.test(text)).map((p) => p.name);
  const riskScore = detected ? 90 : sensitive.length ? 65 : 10;
  const unsafe = detected || sensitive.length > 0;

  return (
    <Section icon={<FaRobot />} title="Shadow AI Analysis">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatBox label="Shadow AI" badge={<StatusBadge status={detected ? 'detected' : 'safe'} />} />
        <StatBox label="Application" value={shadowAi.data?.input?.application_name} color="text-blue-400" />
        <StatBox label="Sensitive Data" value={sensitive.length ? sensitive.join(', ') : 'None'} color={sensitive.length ? 'text-red-400' : 'text-green-400'} />
        <StatBox label="Verdict" badge={<StatusBadge status={unsafe ? 'blocked' : 'allowed'} />} />
      </div>
      <ProgressBar label="Risk Score" value={riskScore} />
      <div className={`rounded-xl p-4 border mt-4 ${unsafe ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
        <p className={`text-sm break-words ${unsafe ? 'text-red-400' : 'text-green-400'}`}>{shadowAi.data?.message}</p>
      </div>
    </Section>
  );
}

function UEBASection({ ueba }) {
  if (!ueba.ok) return <Section icon={<FaChartLine />} title="UEBA Analysis"><ModuleError message={ueba.error} /></Section>;
  const anomaly = ueba.data?.risk_level === 'High';
  return (
    <Section icon={<FaChartLine />} title="UEBA Analysis">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatBox label="User" value={ueba.data?.user} color="text-blue-400" />
        <StatBox label="Risk Level" badge={<StatusBadge status={ueba.data?.risk_level} />} />
        <StatBox label="Anomaly" badge={<StatusBadge status={anomaly ? 'detected' : 'safe'} />} />
        <StatBox label="Action" value={ueba.data?.input?.action} color="text-gray-300" />
      </div>
      <ProgressBar label="Risk Score" value={ueba.data?.risk_level === 'High' ? 90 : ueba.data?.risk_level === 'Medium' ? 55 : 15} />
      <div className={`rounded-xl p-4 border mt-4 ${anomaly ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
        <p className={`text-sm break-words ${anomaly ? 'text-red-400' : 'text-green-400'}`}>{ueba.data?.message}</p>
      </div>
    </Section>
  );
}

function ComplianceSection({ compliance }) {
  return (
    <Section icon={<FaBalanceScale />} title="Compliance Summary">
      <p className="text-gray-300 text-sm mb-4">{compliance?.summary}</p>
      <div className="space-y-3">
        {compliance?.items?.map((item, i) => (
          <div key={i} className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3">
            <div className="min-w-0">
              <p className="text-white text-sm font-medium break-words">{item.name}</p>
              <p className="text-gray-500 text-xs mt-0.5 break-words">{item.detail}</p>
            </div>
            <StatusBadge status={item.status} />
          </div>
        ))}
      </div>
    </Section>
  );
}

function RecommendationsSection({ recommendations }) {
  return (
    <Section icon={<FaListAlt />} title="Final Recommendations">
      <ul className="space-y-3">
        {recommendations?.map((rec, i) => (
          <li key={i} className="flex items-start gap-3 text-gray-200 text-sm">
            <span className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
            <span className="min-w-0 break-words">{rec}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function SecurityReport({ report }) {
  if (!report) return null;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DocumentSection document={report.document} />
      <OCRSection ocr={report.ocr} />
      <PIISection pii={report.pii} />
      <RiskSection risk={report.risk} />
      <PolicyAlertSection policyAlert={report.policyAlert} />
      <EmailDLPSection emailDlp={report.emailDlp} />
      <ClipboardSection clipboard={report.clipboard} />
      <PrintSection printControl={report.printControl} />
      <USBSection usbControl={report.usbControl} />
      <FileTypeSection fileType={report.fileType} />
      <ShadowAISection shadowAi={report.shadowAi} ocr={report.ocr} />
      <UEBASection ueba={report.ueba} />
      <ComplianceSection compliance={report.compliance} />
      <RecommendationsSection recommendations={report.recommendations} />
    </div>
  );
}

export default SecurityReport;
