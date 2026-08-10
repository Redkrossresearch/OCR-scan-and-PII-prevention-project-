import { useSearchParams } from 'react-router-dom';
import { FaLock, FaFilePdf } from 'react-icons/fa';

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8000';

function Unlock() {
  const [searchParams] = useSearchParams();
  const file = searchParams.get('file');
  const hint = searchParams.get('hint');

  const pdfUrl = file ? `${API_BASE_URL}${file}` : null;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="dli-panel max-w-md w-full p-6 md:p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto mb-4">
          <FaLock className="text-indigo-400 text-xl" />
        </div>
        <h1 className="text-white text-xl font-semibold mb-2">Protected Document</h1>
        <p className="text-gray-400 text-sm mb-6">
          This file was encrypted by an AI Data Security Dashboard scan. You'll need a password to open it.
        </p>

        {!pdfUrl ? (
          <div className="rounded-xl p-4 border bg-red-500/10 border-red-500/30">
            <p className="text-sm text-red-400">
              This link is missing information and can't open a document. Ask the sender to re-share it.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-xl p-4 border bg-slate-800/60 border-slate-700/60 mb-6 text-left">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Password Hint</p>
              <p className="text-sm text-gray-300 break-words">
                {hint || "Ask the sender how the password is generated."}
              </p>
            </div>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              <FaFilePdf /> Open PDF
            </a>
            <p className="text-xs text-gray-500 mt-3">
              Your PDF viewer will ask for the password next — use the hint above to work it out.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Unlock;