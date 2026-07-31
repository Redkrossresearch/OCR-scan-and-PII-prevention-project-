import { useState, useRef } from 'react';
import { pii } from '../../services/api';

function DetectionPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pii');
  const fileRef = useRef();

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleDetect = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await pii.detect(file);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Detection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRedact = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await pii.redact(file);
      alert(`Redaction complete: ${data.message}`);
    } catch (err) {
      setError(err.message || 'Redaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await pii.blur(file);
      alert(`Blur complete: ${data.message}`);
    } catch (err) {
      setError(err.message || 'Blur failed');
    } finally {
      setLoading(false);
    }
  };

  const piiItems = result ? [
    { label: 'Emails', value: result.emails, color: 'text-blue-400' },
    { label: 'Phone Numbers', value: result.phone_numbers, color: 'text-green-400' },
    { label: 'Aadhaar Numbers', value: result.aadhaar_numbers, color: 'text-purple-400' },
    { label: 'PAN Numbers', value: result.pan_numbers, color: 'text-amber-400' },
    { label: 'Passport Numbers', value: result.passport_numbers, color: 'text-cyan-400' },
    { label: 'Credit Cards', value: result.credit_cards, color: 'text-red-400' },
    { label: 'SSN Numbers', value: result.ssn_numbers, color: 'text-pink-400' },
  ] : [];

  return (
    <div className="bg-slate-950 min-h-screen p-8">
      <h1 className="text-white text-4xl font-bold mb-8">PII Detection</h1>
      <div className="max-w-4xl">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-6">
          <label className="block text-gray-400 text-sm mb-3">Select a document to scan for PII</label>
          <div className="flex gap-4">
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileSelect}
              className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer" />
            <button onClick={handleDetect} disabled={!file || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50">
              {loading ? 'Scanning...' : 'Detect PII'}
            </button>
          </div>
        </div>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">{error}</div>
        )}
        {result && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-center">
                <p className="text-gray-400 text-sm">Risk Score</p>
                <p className={`text-3xl font-bold ${result.risk_score > 70 ? 'text-red-400' : result.risk_score > 40 ? 'text-amber-400' : 'text-green-400'}`}>
                  {result.risk_score}
                </p>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-center">
                <p className="text-gray-400 text-sm">Risk Level</p>
                <p className={`text-3xl font-bold ${result.risk_level === 'High' ? 'text-red-400' : result.risk_level === 'Medium' ? 'text-amber-400' : 'text-green-400'}`}>
                  {result.risk_level}
                </p>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-center">
                <p className="text-gray-400 text-sm">Classification</p>
                <p className="text-3xl font-bold text-blue-400">{result.classification?.classification || 'N/A'}</p>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-center">
                <p className="text-gray-400 text-sm">Access</p>
                <p className={`text-3xl font-bold ${result.access_allowed ? 'text-green-400' : 'text-red-400'}`}>
                  {result.access_allowed ? 'Allowed' : 'Denied'}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mb-6">
              <button onClick={handleRedact} disabled={loading}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                Redact PII
              </button>
              <button onClick={handleBlur} disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                Blur PII
              </button>
            </div>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="flex border-b border-slate-800">
                {['pii', 'security', 'details'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50' : 'text-gray-500 hover:text-gray-300'
                    }`}>
                    {tab === 'pii' ? 'PII Found' : tab === 'security' ? 'Security' : 'Details'}
                  </button>
                ))}
              </div>
              <div className="p-6">
                {activeTab === 'pii' && (
                  <div className="space-y-3">
                    {piiItems.map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                        <span className="text-gray-400">{item.label}</span>
                        <span className={`${item.color} font-medium`}>
                          {item.value && item.value.length > 0 ? item.value.join(', ') : 'None found'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'security' && (
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-slate-800/50">
                      <span className="text-gray-400">Watermark Detected</span>
                      <span className={result.watermark_detected ? 'text-green-400' : 'text-gray-500'}>
                        {result.watermark_detected ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800/50">
                      <span className="text-gray-400">Digital Signature</span>
                      <span className={result.digital_signature_present ? 'text-green-400' : 'text-gray-500'}>
                        {result.digital_signature_present ? 'Present' : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800/50">
                      <span className="text-gray-400">Password Protected</span>
                      <span className={result.is_password_protected ? 'text-amber-400' : 'text-gray-500'}>
                        {result.is_password_protected ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800/50">
                      <span className="text-gray-400">Tampered</span>
                      <span className={result.tampered ? 'text-red-400' : 'text-green-400'}>
                        {result.tampered ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">EDM Matches</span>
                      <span className="text-cyan-400">{result.edm_matches?.length || 0} found</span>
                    </div>
                  </div>
                )}
                {activeTab === 'details' && (
                  <div>
                    {result.risk_breakdown && (
                      <div className="mb-4">
                        <h3 className="text-white font-medium mb-2">Risk Breakdown</h3>
                        {Object.entries(result.risk_breakdown).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1 text-sm">
                            <span className="text-gray-400">{key}</span>
                            <span className="text-gray-300">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {result.keywords && result.keywords.length > 0 && (
                      <div>
                        <h3 className="text-white font-medium mb-2">Keywords Found</h3>
                        <div className="flex flex-wrap gap-2">
                          {result.keywords.map((kw, i) => (
                            <span key={i} className="bg-slate-800 text-gray-300 px-3 py-1 rounded-lg text-sm">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DetectionPage;
