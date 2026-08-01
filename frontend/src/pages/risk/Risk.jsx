import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentAnalysis } from '../../context/DocumentAnalysisContext';
import { documentFeatures, audit } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PII_KEYS = [
  { key: 'emails', label: 'Emails' },
  { key: 'phone_numbers', label: 'Phone Numbers' },
  { key: 'aadhaar_numbers', label: 'Aadhaar Numbers' },
  { key: 'pan_numbers', label: 'PAN Numbers' },
  { key: 'passport_numbers', label: 'Passport Numbers' },
  { key: 'credit_cards', label: 'Credit Cards' },
  { key: 'ssn_numbers', label: 'SSN Numbers' },
];

function riskColor(level) {
  const l = String(level || '').toLowerCase();
  if (l.includes('critical')) return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', hex: '#ef4444' };
  if (l.includes('high')) return { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', hex: '#f97316' };
  if (l.includes('medium')) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', hex: '#f59e0b' };
  return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', hex: '#22c55e' };
}

function riskGauge(score, hex) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;
  return (
    <svg viewBox="0 0 180 180" className="w-48 h-48">
      <circle cx="90" cy="90" r={radius} fill="none" stroke="#1e293b" strokeWidth="14" />
      <circle
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke={hex}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 90 90)"
        className="transition-all duration-700"
      />
      <text x="90" y="86" textAnchor="middle" fill="#fff" fontSize="34" fontWeight="bold">
        {score}
      </text>
      <text x="90" y="112" textAnchor="middle" fill="#64748b" fontSize="13">
        / 100
      </text>
    </svg>
  );
}

function buildFactors(report) {
  const factors = [];
  const pii = report?.pii?.data || {};

  const breakdown = pii.risk_breakdown;
  if (Array.isArray(breakdown)) {
    breakdown.forEach((item) => {
      if (typeof item === 'string') {
        factors.push({ label: item, weight: 'high', reason: 'Contributing factor flagged by the risk engine.' });
      } else if (item && typeof item === 'object') {
        const name = item.category || item.label || item.name || 'Risk factor';
        const weight = item.weight || (item.score > 40 ? 'high' : 'medium');
        factors.push({ label: name, weight, reason: item.reason || item.detail || `Score contribution: ${item.score ?? 'n/a'}` });
      }
    });
  } else if (breakdown && typeof breakdown === 'object') {
    Object.entries(breakdown).forEach(([name, score]) => {
      factors.push({ label: name.replace(/_/g, ' '), weight: score > 40 ? 'high' : 'medium', reason: `Score contribution: ${score}` });
    });
  }

  PII_KEYS.forEach(({ key, label }) => {
    if (Array.isArray(pii[key]) && pii[key].length > 0) {
      factors.push({
        label: `${label} detected`,
        weight: key === 'credit_cards' || key === 'ssn_numbers' || key === 'aadhaar_numbers' ? 'critical' : 'high',
        reason: `${pii[key].length} instance(s) of ${label.toLowerCase()} present in the document.`,
      });
    }
  });

  const blockedControls = ['emailDlp', 'clipboard', 'printControl', 'usbControl', 'fileType'].filter(
    (key) => report?.[key]?.data && (report[key].data.blocked || report[key].data.allowed === false || report[key].data.usb_allowed === false || report[key].data.sensitive_data_found)
  );
  if (blockedControls.length > 0) {
    factors.push({
      label: `${blockedControls.length} DLP control(s) triggered`,
      weight: 'high',
      reason: 'One or more data-loss prevention controls blocked or flagged this document.',
    });
  }
  if (report?.shadowAi?.data?.shadow_ai_detected) {
    factors.push({ label: 'Shadow AI usage detected', weight: 'high', reason: 'Unauthorized AI tool use was identified in the document content.' });
  }
  if (report?.ueba?.data?.risk_level === 'High') {
    factors.push({ label: 'High-risk user behavior', weight: 'medium', reason: 'User behavior analysis flagged abnormal access patterns.' });
  }

  if (factors.length === 0) {
    factors.push({ label: 'Low detected exposure', weight: 'low', reason: 'No significant risk factors identified in the scanned document.' });
  }
  return factors;
}

function RiskPage() {
  const { report, error } = useDocumentAnalysis();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState('employee');
  const [accessResult, setAccessResult] = useState(null);
  const [accessLoading, setAccessLoading] = useState(false);

  const risk = report?.risk || {};
  const riskLevel = risk.risk_level || 'Low';
  const riskScore = Math.min(100, Number(risk.risk_score) || 0);
  const colors = riskColor(riskLevel);
  const factors = buildFactors(report);
  const recommendations = report?.recommendations || [];

  const handleAccessCheck = async () => {
    setAccessLoading(true);
    setAccessResult(null);
    try {
      const level = String(riskLevel || '').toLowerCase();
      const data = await documentFeatures.accessCheck(userRole, level);
      setAccessResult(data);
      audit.log(user?.email, 'ACCESS_CHECK', `Access check: role=${userRole}, risk=${level} → ${data.access || data.access_allowed}`);
    } catch (err) {
      setAccessResult({ access: 'Error', reason: err.message || 'Access check failed' });
    } finally {
      setAccessLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen p-4 sm:p-6 lg:p-8">
      <h1 className="font-display text-white text-2xl md:text-3xl font-semibold mb-2">Risk Analysis</h1>
      <p className="text-gray-500 mb-8">Risk score and contributing factors computed from the most recent document scan.</p>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 break-words">{error}</div>}

      {!report ? (
        <div className="dli-panel p-12 text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h2 className="text-white text-xl font-bold mb-2">No analysis yet</h2>
          <p className="text-gray-500 mb-6">
            Run a document scan on the OCR page to generate a risk assessment from live OCR and PII results.
          </p>
          <Link to="/ocr" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Analyze a Document
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary row */}
          <div className="dli-panel p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="flex justify-center">{riskGauge(riskScore, colors.hex)}</div>
              <div className="min-w-0">
                <div className="text-sm text-gray-500 mb-1">Document</div>
                <div className="text-white font-semibold mb-4 break-words">{report.document?.filename || '—'}</div>
                <div className="text-sm text-gray-500 mb-1">Risk Level</div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
                  {riskLevel}
                </span>
                <div className="text-sm text-gray-500 mt-4 mb-1">Classification</div>
                <div className="text-white font-semibold break-words">{risk.classification || 'Unclassified'}</div>
              </div>
              <div className="min-w-0">
                <div className="text-sm text-gray-500 mb-1">Scanned</div>
                <div className="text-white mb-4 break-words">{report.document?.scanned_at ? new Date(report.document.scanned_at).toLocaleString() : '—'}</div>
                <div className="text-sm text-gray-500 mb-1">Analyzed By</div>
                <div className="text-white break-words">{report.document?.user || '—'}</div>
              </div>
            </div>
          </div>

          {/* Contributing factors */}
          <div className="dli-panel p-5 md:p-6">
            <h2 className="text-white text-lg font-bold mb-4">Contributing Factors</h2>
            <div className="space-y-3">
              {factors.map((factor, i) => {
                const fc = riskColor(factor.weight);
                return (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/40">
                    <span className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${fc.bg} border ${fc.border}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium break-words">{factor.label}</div>
                      <div className="text-gray-500 text-sm mt-0.5 break-words">{factor.reason}</div>
                    </div>
                    <span className={`ml-auto shrink-0 text-xs font-bold uppercase px-2 py-1 rounded-full ${fc.bg} ${fc.text} border ${fc.border}`}>
                      {factor.weight}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div className="dli-panel p-5 md:p-6">
            <h2 className="text-white text-lg font-bold mb-4">Recommendations</h2>
            <ol className="space-y-3">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3 text-gray-300">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <span className="min-w-0 break-words">{rec}</span>
                </li>
              ))}
              {recommendations.length === 0 && <li className="text-gray-500">No recommendations available for this scan.</li>}
            </ol>
          </div>

          {/* Access control tool */}
          <div className="dli-panel p-5 md:p-6">
            <h2 className="text-white text-lg font-bold mb-4">Access Control Check</h2>
            <p className="text-gray-500 text-sm mb-4">
              Evaluate whether a user role should be granted access to a document at the scanned risk level ({riskLevel}).
            </p>
            <div className="flex flex-wrap items-end gap-4 mb-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">User Role</label>
                <select value={userRole} onChange={(e) => setUserRole(e.target.value)}
                  className="w-48 bg-slate-800/70 border border-slate-700/70 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors">
                  <option value="viewer">Viewer</option>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button onClick={handleAccessCheck} disabled={accessLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50">
                {accessLoading ? 'Checking...' : 'Check Access'}
              </button>
            </div>
            {accessResult && (
              <div className={`rounded-xl p-4 border ${
                String(accessResult.access).toLowerCase() === 'granted' || accessResult.access_allowed
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  <span className={`text-2xl font-bold ${String(accessResult.access).toLowerCase() === 'granted' || accessResult.access_allowed ? 'text-green-400' : 'text-red-400'}`}>
                    {accessResult.access || (accessResult.access_allowed ? 'Granted' : 'Denied')}
                  </span>
                  <span className="text-gray-400 text-sm min-w-0 break-words">{(accessResult.reason || accessResult.message || accessResult.access_reason || '').toString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RiskPage;
