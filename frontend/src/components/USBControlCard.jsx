import { FaUsb } from 'react-icons/fa';
import { useDocumentAnalysis } from '../context/DocumentAnalysisContext';
import { Card, Spinner, StatusBadge, StatBox, EmptyAnalysis, ModuleError } from './common/UI';

function USBControlCard() {
  const { report, analyzing, currentStep } = useDocumentAnalysis();
  const usbControl = report?.usbControl;

  return (
    <Card title="USB Control" subtitle="USB policy result for the last scanned document" icon={<FaUsb />}>
      {analyzing && !report && <Spinner label={currentStep || 'Analyzing document...'} />}

      {!analyzing && !report && <EmptyAnalysis message="No USB check yet. Scan a document to run the USB control module." />}

      {report && !usbControl?.ok && <ModuleError message={usbControl?.error || 'USB control module failed.'} />}

      {report && usbControl?.ok && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatBox
              label="USB Status"
              badge={<StatusBadge status={usbControl.data?.usb_allowed ? 'enabled' : 'disabled'} />}
            />
            <StatBox
              label="Access"
              badge={<StatusBadge status={usbControl.data?.usb_allowed ? 'allowed' : 'blocked'} />}
            />
            <StatBox label="Device" value={usbControl.data?.input?.device_name} color="text-blue-400" />
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Device Information</p>
            <p className="text-white text-sm break-words">{usbControl.data?.input?.device_name}</p>
            <p className="text-gray-500 text-xs mt-1">User Role: {usbControl.data?.input?.user_role}</p>
          </div>

          <div
            className={`rounded-xl p-4 border ${
              usbControl.data?.usb_allowed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <p className={`text-sm break-words ${usbControl.data?.usb_allowed ? 'text-green-400' : 'text-red-400'}`}>
              {usbControl.data?.message}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

export default USBControlCard;
