import { useRef, useState } from 'react';
import {
  FaFileAlt,
  FaSearch,
  FaShieldAlt,
  FaExclamationTriangle,
  FaClipboardCheck,
  FaPrint,
  FaRobot,
  FaChartLine,
  FaBalanceScale,
  FaListAlt,
  FaLock,
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
  { key: 'ifsc_codes', label: 'IFSC Codes', color: 'text-indigo-400' },
  { key: 'gstin_numbers', label: 'GSTIN', color: 'text-orange-400' },
  { key: 'bank_account_numbers', label: 'Bank Accounts', color: 'text-teal-400' },
];

function Section({ icon, title, children }) {
  return (
    <div className="dli-panel p-5 md:p-6 mb-6 break-inside-avoid">
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

function OCRSection({ ocr, clipboard }) {
  if (!ocr.ok) return <Section icon={<FaSearch />} title="OCR Results"><ModuleError message={ocr.error} /></Section>;
  const text = ocr.data?.extracted_text || 'No text could be extracted.';
  const isBlocked = clipboard?.ok && clipboard?.data?.blocked === true;

  const handleCopyAttempt = (e) => {
    if (isBlocked) e.preventDefault();
  };

  return (
    <Section icon={<FaSearch />} title="OCR Results">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="text-white font-medium truncate max-w-full">{ocr.data?.filename}</p>
          <p className="text-gray-500 text-sm">Type: {String(ocr.data?.file_type || '').toUpperCase()}</p>
        </div>
        <StatusBadge status={text.length > 0 ? 'allowed' : 'unsupported'} />
      </div>
      <pre
        onCopy={handleCopyAttempt}
        onCut={handleCopyAttempt}
        className={`text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-56 overflow-y-auto bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 ${
          isBlocked ? 'select-none' : ''
        }`}
      >
        {text}
      </pre>
      {isBlocked && (
        <p className="text-gray-500 text-xs mt-2">Sensitive data detected — selecting and copying this text is disabled.</p>
      )}
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
      {Array.isArray(pii.data.keyword_categories) && pii.data.keyword_categories.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-2">Sensitive Content Categories</p>
          <div className="flex flex-wrap gap-2">
            {pii.data.keyword_categories.map((cat, i) => (
              <span key={i} className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1 rounded-lg text-sm">{cat}</span>
            ))}
          </div>
        </div>
      )}
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <StatBox label="Risk Score" value={risk.risk_score} color={scoreColor} />
        <StatBox label="Risk Level" badge={<StatusBadge status={risk.risk_level} />} />
        <StatBox label="Access" badge={<StatusBadge status={access?.access === 'Granted' ? 'allowed' : 'blocked'} />} />
      </div>
      <ProgressBar label="Risk Score" value={risk.risk_score} />
      {access && <p className="text-gray-400 text-sm mt-3 break-words">Role: {access.role} — {access.access} for {access.risk_level} risk documents</p>}
    </Section>
  );
}



function ClipboardSection({ clipboard, extractedText }) {
  const [copyStatus, setCopyStatus] = useState('');
  const [pasteValue, setPasteValue] = useState('');

  if (!clipboard.ok) return <Section icon={<FaClipboardCheck />} title="Clipboard Analysis"><ModuleError message={clipboard.error} /></Section>;

  const isBlocked = clipboard.data?.blocked === true;

  const handleCopy = async () => {
    if (isBlocked || !extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopyStatus('Copied to clipboard.');
    } catch {
      setCopyStatus('Copy failed — browser blocked clipboard permission.');
    }
    setTimeout(() => setCopyStatus(''), 2500);
  };

  const handlePasteAttempt = (e) => {
    if (isBlocked) {
      e.preventDefault();
      setPasteValue('⚠ Paste blocked — sensitive data policy in effect.');
      setTimeout(() => setPasteValue(''), 2500);
    }
  };

  return (
    <Section icon={<FaClipboardCheck />} title="Clipboard Analysis">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatBox label="Verdict" badge={<StatusBadge status={isBlocked ? 'blocked' : 'allowed'} />} />
        <StatBox label="Sensitive Data" value={isBlocked ? 'Detected' : 'None'} color={isBlocked ? 'text-red-400' : 'text-green-400'} />
      </div>
      <div className={`rounded-xl p-4 border mb-4 ${isBlocked ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
        <p className={`text-sm break-words ${isBlocked ? 'text-red-400' : 'text-green-400'}`}>{clipboard.data?.reason}</p>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        disabled={isBlocked || !extractedText}
        title={isBlocked ? 'Copying is blocked — sensitive data detected' : 'Copy extracted text to clipboard'}
        className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-colors ${
          isBlocked || !extractedText
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60 pointer-events-none'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
        }`}
      >
        <FaClipboardCheck />
        {isBlocked ? 'Copy Blocked' : 'Copy Extracted Text'}
      </button>
      {copyStatus && (
        <p className={`text-xs text-center mt-2 ${copyStatus.startsWith('Copied') ? 'text-green-400' : 'text-red-400'}`}>{copyStatus}</p>
      )}

      <div className="mt-4">
        <p className="text-gray-500 text-xs mb-1.5">Live proof — press Ctrl+V (or Cmd+V) here to test:</p>
        <textarea
          value={pasteValue}
          onChange={(e) => setPasteValue(e.target.value)}
          onPaste={handlePasteAttempt}
          rows={3}
          placeholder="Paste here after clicking Copy above"
          className="w-full bg-slate-800/70 border border-slate-700/70 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 resize-none"
        />
        <p className="text-gray-600 text-[11px] mt-1.5">
          For stronger proof, try pasting outside the browser too (Notepad, WhatsApp, etc.) — when blocked, nothing
          was ever written to the system clipboard, so the extracted text won't appear anywhere.
        </p>
      </div>
    </Section>
  );
}

function PrintSection({ printControl, file }) {
  const iframeRef = useRef(null);
  if (!printControl.ok) return <Section icon={<FaPrint />} title="Print Policy Result"><ModuleError message={printControl.error} /></Section>;

  const isAllowed = printControl.data?.allowed === true;

  const handlePrint = () => {
    if (!isAllowed || !file) return;
    const fileURL = URL.createObjectURL(file);
    const iframe = iframeRef.current;
    iframe.src = fileURL;
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
    };
  };

  return (
    <Section icon={<FaPrint />} title="Print Policy Result">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <StatBox label="Permission" badge={<StatusBadge status={isAllowed ? 'allowed' : 'blocked'} />} />
        <StatBox label="Document Type" value={printControl.data?.input?.document_type} color="text-blue-400" className="capitalize" />
        <StatBox label="User Role" value={printControl.data?.input?.user_role} color="text-gray-300" className="capitalize" />
      </div>
      <div className={`rounded-xl p-4 border mb-4 ${isAllowed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
        <p className={`text-sm break-words ${isAllowed ? 'text-green-400' : 'text-red-400'}`}>{printControl.data?.message}</p>
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
      <iframe ref={iframeRef} title="print-frame" style={{ display: 'none' }} />
    </Section>
  );
}

function EncryptionSection({ encryption }) {
  const [linkCopied, setLinkCopied] = useState(false);

  if (!encryption?.ok) return <Section icon={<FaLock />} title="Document Protection"><ModuleError message={encryption?.error || 'Encryption check failed'} /></Section>;
  const d = encryption.data;

  if (!d?.encrypted) {
    return (
      <Section icon={<FaLock />} title="Document Protection">
        <div className="rounded-xl p-4 border bg-green-500/10 border-green-500/30">
          <p className="text-sm text-green-400 break-words">{d?.message || 'Encryption not required for this risk level.'}</p>
        </div>
      </Section>
    );
  }

  const handleCopyLink = async () => {
    const params = new URLSearchParams({ file: d.protected_file || '', hint: d.hint || '' });
    const shareUrl = `${window.location.origin}/unlock?${params.toString()}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', shareUrl);
    }
  };

  return (
    <Section icon={<FaLock />} title="Document Protection">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <StatBox label="Status" badge={<StatusBadge status="blocked" />} />
        <StatBox label="Your Access" badge={<StatusBadge status={d?.authorized ? 'allowed' : 'blocked'} />} />
        <StatBox label="Password" value={d?.authorized ? d?.password : 'Hidden'} color={d?.authorized ? 'text-amber-400' : 'text-gray-500'} />
      </div>
      {d?.authorized && (
        <div className="rounded-xl p-4 border mb-4 bg-slate-800/60 border-slate-700/60">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
            Password Hint
          </p>
          <p className="text-sm text-gray-300 break-words">
            {d?.hint}
          </p>
        </div>
      )}

      <div className={`rounded-xl p-4 border mb-4 ${d?.authorized ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
        <p className={`text-sm break-words ${d?.authorized ? 'text-amber-400' : 'text-red-400'}`}>{d?.message}</p>
      </div>
      {d?.protected_file && d?.authorized && (
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`${(import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8000'}${d.protected_file}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 block text-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Download Protected PDF
          </a>
          <button
            onClick={handleCopyLink}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {linkCopied ? 'Link Copied!' : 'Copy Share Link'}
          </button>
        </div>
      )}
    </Section>
  );
}

const AI_TOOL_NAMES = ['chatgpt', 'openai', 'copilot', 'gemini', 'bard', 'claude'];

function detectAIMention(text) {
  const lower = String(text || '').toLowerCase();
  return AI_TOOL_NAMES.filter((name) => lower.includes(name));
}

// Heavier weight = riskier to leak if this field ends up inside an AI chat prompt.
const PASTE_RISK_WEIGHTS = { Email: 15, 'Phone Number': 25, PAN: 35, Aadhaar: 40, 'Credit Card': 50 };

function calculatePasteRiskScore(sensitiveTypes) {
  const score = sensitiveTypes.reduce((sum, type) => sum + (PASTE_RISK_WEIGHTS[type] || 10), 0);
  return Math.min(score, 100);
}

function ShadowAISection({ shadowAi, pii, ocrText }) {
  if (!shadowAi.ok) return <Section icon={<FaRobot />} title="Shadow AI Analysis"><ModuleError message={shadowAi.error} /></Section>;
  const detected = shadowAi.data?.shadow_ai_detected === true;

  const sensitiveTypes = pii?.ok
    ? PII_COUNTS.filter((item) => pii.data?.[item.key]?.length > 0).map((item) => item.label)
    : [];
  const keywordCategories = pii?.ok && Array.isArray(pii.data?.keyword_categories) ? pii.data.keyword_categories : [];
  const sensitive = [...sensitiveTypes, ...keywordCategories];

  const aiMentions = detectAIMention(ocrText);
  const aiMentionScore = aiMentions.length ? 100 : 0;
  const pasteRiskScore = calculatePasteRiskScore(sensitive);
  const unsafe = detected || sensitive.length > 0;

  return (
    <Section icon={<FaRobot />} title="Shadow AI Analysis">
      <div className="flex flex-wrap gap-3 mb-4">
        <StatBox label="Shadow AI" badge={<StatusBadge status={detected ? 'detected' : 'safe'} />} className="flex-1 min-w-[140px]" />
        <StatBox label="Sensitive Data" value={sensitive.length ? sensitive.join(', ') : 'None'} color={sensitive.length ? 'text-red-400' : 'text-green-400'} className="flex-1 min-w-[140px]" />
        <StatBox
          label="Detected At"
          value={shadowAi.data?.detected_at ? new Date(shadowAi.data.detected_at).toLocaleString() : '—'}
          color="text-gray-300"
          className="flex-1 min-w-[140px]"
        />
      </div>
      <ProgressBar label="AI Tool Mention Score" value={aiMentionScore} />
      <p className="text-slate-500 text-xs mt-1">
        {aiMentions.length
          ? `Document/image text mentions: ${aiMentions.join(', ')}`
          : 'No AI tool names found in the document/image text.'}
      </p>

      <ProgressBar label="Paste Risk Score (ChatGPT / Copilot)" value={pasteRiskScore} />
      <p className="text-slate-500 text-xs mt-1">
        {sensitive.length
          ? `If this doc were pasted into an AI chat, it would expose: ${sensitive.join(', ')}`
          : 'No sensitive data found — low risk if this doc were pasted into an AI chat.'}
      </p>
      <p className="text-slate-500 text-xs mt-1">Not the document's overall risk score (see Risk tab).</p>
      <div className={`rounded-xl p-4 border mt-4 ${unsafe ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
        <p className={`text-sm break-words ${unsafe ? 'text-red-400' : 'text-green-400'}`}>{shadowAi.data?.message}</p>
      </div>
    </Section>
  );
}

function UEBASection({ ueba }) {
  if (!ueba.ok) return <Section icon={<FaChartLine />} title="UEBA Analysis"><ModuleError message={ueba.error} /></Section>;
  const anomaly = ueba.data?.risk_level === 'High' || ueba.data?.risk_level === 'Critical';
  const uebaScore =
    ueba.data?.risk_level === 'Critical' ? 100 : ueba.data?.risk_level === 'High' ? 90 : ueba.data?.risk_level === 'Medium' ? 55 : 0;
  return (
    <Section icon={<FaChartLine />} title="UEBA Analysis">
      <div className="flex flex-wrap gap-3 mb-4">
        <StatBox label="User" value={ueba.data?.user} color="text-blue-400" className="flex-1 min-w-[140px]" />
        <StatBox label="Risk Level" badge={<StatusBadge status={ueba.data?.risk_level} />} className="flex-1 min-w-[140px]" />
        <StatBox label="Anomaly" badge={<StatusBadge status={anomaly ? 'detected' : 'safe'} />} className="flex-1 min-w-[140px]" />
      </div>
      <ProgressBar label="Risk Score" value={uebaScore} />
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

function SecurityReport({ report, file }) {
  if (!report) return null;
  return (
    <div className="columns-1 lg:columns-2 gap-6">
      <DocumentSection document={report.document} />
      <OCRSection ocr={report.ocr} clipboard={report.clipboard} />
      <PIISection pii={report.pii} />
      <RiskSection risk={report.risk} />
      
      <ClipboardSection clipboard={report.clipboard} extractedText={report.ocr?.ok ? report.ocr.data?.extracted_text || '' : ''} />
      <PrintSection printControl={report.printControl} file={file} />
      <EncryptionSection encryption={report.encryption} />
      <ShadowAISection
        shadowAi={report.shadowAi}
        pii={report.pii}
        ocrText={report.ocr?.ok ? report.ocr.data?.extracted_text || '' : ''}
      />
      <UEBASection ueba={report.ueba} />
      <ComplianceSection compliance={report.compliance} />
      <RecommendationsSection recommendations={report.recommendations} />
    </div>
  );
}

export default SecurityReport;