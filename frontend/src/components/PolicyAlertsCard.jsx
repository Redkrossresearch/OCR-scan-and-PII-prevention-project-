import { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { policyAlerts } from '../services/api';
import { useDocumentAnalysis } from '../context/DocumentAnalysisContext';
import { Card, Spinner, StatusBadge, EmptyAnalysis, ModuleError } from './common/UI';

function PolicyAlertsCard() {
  const { report, analyzing, currentStep } = useDocumentAnalysis();
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await policyAlerts.getAll();
        if (!cancelled) setAlerts(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setAlertsError(err.message || 'Failed to load alerts');
      } finally {
        if (!cancelled) setAlertsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const alert = report?.policyAlert;

  return (
    <Card title="Policy Alerts" subtitle="Alerts raised for the last scanned document" icon={<FaBell />}>
      {analyzing && !report && <Spinner label={currentStep || 'Analyzing document...'} />}

      {!analyzing && !report && <EmptyAnalysis message="No policy alerts yet. Scan a document to generate alerts automatically." />}

      {report && !alert?.ok && <ModuleError message={alert?.error || 'Policy alert could not be generated.'} />}

      {report && alert?.ok && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <p className="text-white font-semibold">{alert.data?.alert?.policy_name || alert.data?.policy_name}</p>
            <div className="flex gap-2">
              <StatusBadge status={alert.data?.alert?.severity || alert.data?.severity} />
              <StatusBadge status="active" />
            </div>
          </div>
          <p className="text-gray-300 text-sm">{alert.data?.alert?.description || alert.data?.description}</p>
          <p className="text-gray-500 text-xs mt-2">{alert.data?.message}</p>
        </div>
      )}

      <div className="border-t border-slate-800 pt-4">
        <h3 className="text-gray-300 font-semibold text-sm mb-3">Existing Alerts</h3>
        {alertsLoading ? (
          <Spinner label="Loading alerts..." />
        ) : alertsError ? (
          <ModuleError message={alertsError} />
        ) : alerts.length === 0 ? (
          <p className="text-gray-500 text-sm">No policy alerts found.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-white text-sm font-medium">{item.policy_name}</p>
                  <p className="text-gray-500 text-xs">
                    {item.created_at ? `Created ${new Date(item.created_at).toLocaleString()}` : 'Recently created'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={item.severity} />
                  <StatusBadge status={item.status || 'active'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default PolicyAlertsCard;
