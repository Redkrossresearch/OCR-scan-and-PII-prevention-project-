import { FaFileContract } from 'react-icons/fa';
import { useDocumentAnalysis } from '../context/DocumentAnalysisContext';
import { Card, Spinner, StatusBadge, StatBox, EmptyAnalysis, ModuleError } from './common/UI';

function FileTypeBlockingCard() {
  const { report, analyzing, currentStep } = useDocumentAnalysis();
  const fileType = report?.fileType;

  const getExtension = (name) => {
    const parts = String(name || '').split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  };

  const extension = fileType?.ok ? getExtension(fileType.data?.input?.filename) : '';
  const status = fileType?.ok ? (fileType.data?.allowed ? 'allowed' : extension ? 'blocked' : 'unsupported') : '';

  return (
    <Card title="File Type Blocking" subtitle="File type validation for the last scanned document" icon={<FaFileContract />}>
      {analyzing && !report && <Spinner label={currentStep || 'Analyzing document...'} />}

      {!analyzing && !report && <EmptyAnalysis message="No file type check yet. Scan a document to validate its file type." />}

      {report && !fileType?.ok && <ModuleError message={fileType?.error || 'File type module failed.'} />}

      {report && fileType?.ok && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatBox label="Verdict" badge={<StatusBadge status={status} />} />
            <StatBox label="Extension" value={extension ? `.${extension}` : 'None'} color="text-blue-400" />
            <StatBox label="Filename" value={fileType.data?.input?.filename} color="text-gray-300" />
          </div>

          <div
            className={`rounded-xl p-4 border ${
              status === 'allowed'
                ? 'bg-green-500/10 border-green-500/30'
                : status === 'blocked'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}
          >
            <p
              className={`text-sm break-words ${
                status === 'allowed'
                  ? 'text-green-400'
                  : status === 'blocked'
                  ? 'text-red-400'
                  : 'text-amber-400'
              }`}
            >
              {status === 'blocked'
                ? fileType.data?.message
                : status === 'allowed'
                ? 'File type is allowed. The document can be uploaded safely.'
                : 'Unsupported file type. The file has no recognisable extension.'}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

export default FileTypeBlockingCard;
