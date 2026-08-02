import { useState, useRef } from 'react';
import { upload } from '../../services/api';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [expiryDays, setExpiryDays] = useState('');
  const fileRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);
    try {
      const uploadResult = await upload.file(file, expiryDays);
      setResult({ message: uploadResult.message, filename: uploadResult.filename });
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-slate-950 min-h-screen p-4 sm:p-6 lg:p-8">
      <h1 className="font-display text-white text-2xl md:text-3xl font-semibold mb-2">Upload Document</h1>
      <p className="text-gray-500 mb-8">Upload a supported document to begin the security pipeline.</p>
      <div className="max-w-2xl">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            dragOver ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-900'
          }`}
        >
          <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileSelect} className="hidden" />
          {file ? (
            <div>
              <p className="text-white font-medium mb-2 break-words">{file.name}</p>
              <p className="text-gray-500 text-sm">{formatSize(file.size)}</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-400 text-lg mb-2">Drag and drop a file here, or click to select</p>
              <p className="text-gray-600 text-sm">Supported: PDF, PNG, JPG, JPEG</p>
            </div>
          )}
        </div>
        {file && (
          <div className="mt-6">
            <label className="text-gray-400 text-sm mb-2 block">
              Expires in (days) — optional
            </label>
            <input
              type="number"
              min="1"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              placeholder="e.g. 30"
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}
        {file && (
          <button onClick={handleUpload} disabled={uploading}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        )}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl break-words">{error}</div>
        )}
        {result && (
          <div className="mt-4 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl">
            <p className="font-medium">Upload Successful</p>
            <p className="text-sm break-words">{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadPage;
