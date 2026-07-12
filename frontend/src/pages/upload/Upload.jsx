import { useState, useRef } from 'react';
import { upload } from '../../services/api';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
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
      const uploadResult = await upload.file(file);
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
    <div className="bg-slate-950 min-h-screen p-8">
      <h1 className="text-white text-4xl font-bold mb-8">Upload Document</h1>
      <div className="max-w-2xl">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-900'
          }`}
        >
          <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileSelect} className="hidden" />
          {file ? (
            <div>
              <p className="text-white font-medium mb-2">{file.name}</p>
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
          <button onClick={handleUpload} disabled={uploading}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        )}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">{error}</div>
        )}
        {result && (
          <div className="mt-4 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl">
            <p className="font-medium">Upload Successful</p>
            <p className="text-sm">{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadPage;
