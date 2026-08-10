import { useState } from 'react';
import { FaClipboardCheck } from 'react-icons/fa';
import { useDocumentAnalysis } from '../context/DocumentAnalysisContext';
import { Card, Spinner, StatusBadge, StatBox, EmptyAnalysis, ModuleError } from './common/UI';

function ClipboardCard() {
  const { report, analyzing, currentStep } = useDocumentAnalysis();
  const clipboard = report?.clipboard;
  const isBlocked = clipboard?.data?.blocked === true;
  const extractedText = report?.ocr?.ok ? report.ocr.data?.extracted_text || '' : '';

  const [copyStatus, setCopyStatus] = useState('');
  const [pasteValue, setPasteValue] = useState('');

  const sensitiveData = clipboard?.data?.reason?.includes('Sensitive data detected')
    ? clipboard.data.reason.split('Sensitive data detected:')[1]?.trim() || 'Yes'
    : clipboard?.data?.blocked
    ? 'Yes'
    : 'None found';

  const riskScore = clipboard?.data?.blocked ? 85 : 10;

  // Real gate: when blocked, we never touch the OS clipboard at all — so
  // pasting anywhere (this page, Notepad, WhatsApp, etc.) after clicking this
  // will show whatever was already on the clipboard, never the extracted text.
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

  // Belt-and-braces: even if something pastes directly into this box, refuse
  // the paste event itself while blocked, instead of just disabling the field.
  const handlePasteAttempt = (e) => {
    if (isBlocked) {
      e.preventDefault();
      setPasteValue('⚠ Paste blocked — sensitive data policy in effect.');
      setTimeout(() => setPasteValue(''), 2500);
    }
  };

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
            <p className={`text-xs text-center ${copyStatus.startsWith('Copied') ? 'text-green-400' : 'text-red-400'}`}>{copyStatus}</p>
          )}

          <div>
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
              For stronger proof, try pasting outside the browser too (Notepad, WhatsApp, etc.) — when blocked,
              nothing was ever written to the system clipboard, so the extracted text won't appear anywhere.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

export default ClipboardCard;