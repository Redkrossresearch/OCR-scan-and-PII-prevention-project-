import { useState, useRef } from 'react';
import { ocr } from '../../services/api';

function OCRPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await ocr.extractText(file);
      setResult(data);
    } catch (err) {
      setError(err.message || 'OCR extraction failed');
    } finally {
      setLoading(false);
    }
  };

  const copyText = () => {
    if (result?.extracted_text) {
      navigator.clipboard.writeText(result.extracted_text);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen p-8">
      <h1 className="text-white text-4xl font-bold mb-8">OCR Text Extraction</h1>
      <div className="max-w-3xl">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-6">
          <label className="block text-gray-400 text-sm mb-3">Select a file (PDF, PNG, JPG)</label>
          <div className="flex gap-4">
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileSelect}
              className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer" />
            <button onClick={handleExtract} disabled={!file || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50">
              {loading ? 'Extracting...' : 'Extract Text'}
            </button>
          </div>
        </div>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">{error}</div>
        )}
        {result && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h2 className="text-white font-bold">Extracted Text</h2>
                <p className="text-gray-500 text-sm">{result.filename} ({result.file_type?.toUpperCase()})</p>
              </div>
              <button onClick={copyText}
                className="bg-slate-800 hover:bg-slate-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors">
                Copy
              </button>
            </div>
            <div className="p-6">
              <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
                {result.extracted_text || 'No text could be extracted.'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OCRPage;
