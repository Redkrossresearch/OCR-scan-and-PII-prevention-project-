import { useState, useEffect } from 'react';
import { FaChartLine } from 'react-icons/fa';
import { ueba } from '../services/api';
import { useDocumentAnalysis } from '../context/DocumentAnalysisContext';
import { Card, Spinner, StatusBadge, StatBox, ProgressBar, EmptyAnalysis, ModuleError } from './common/UI';

const RISK_SCORE = { Low: 15, Medium: 55, High: 90 };

function UEBACard() {
  const { report, analyzing, currentStep } = useDocumentAnalysis();
  const uebaResult = report?.ueba;
  const username = report?.document?.user || '';
  const [activities, setActivities] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    const load = async () => {
      setLogsLoading(true);
      try {
        const data = await ueba.logs();
        if (!cancelled) {
          setActivities(Array.isArray(data.activities) ? data.activities.filter((a) => a.user === username) : []);
        }
      } catch {
        if (!cancelled) setActivities([]);
      } finally {
        if (!cancelled) setLogsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  const riskScore = uebaResult?.ok ? RISK_SCORE[uebaResult.data?.risk_level] ?? 0 : 0;
  const anomaly = uebaResult?.ok && uebaResult.data?.risk_level === 'High';

  const recommendations = uebaResult?.ok
    ? uebaResult.data?.risk_level === 'High'
      ? 'Anomalies detected. Suspend access and review the user account for compromise or data exfiltration.'
      : uebaResult.data?.risk_level === 'Medium'
      ? 'Elevated behavior detected. Monitor this user closely and enforce additional verification.'
      : 'Behavior is within normal limits. Continue routine monitoring.'
    : '';

  return (
    <Card title="User & Entity Behavior Analytics (UEBA)" subtitle="UEBA analysis for the last scanned document" icon={<FaChartLine />}>
      {analyzing && !report && <Spinner label={currentStep || 'Analyzing document...'} />}

      {!analyzing && !report && <EmptyAnalysis message="No UEBA analysis yet. Scan a document to run the UEBA module." />}

      {report && !uebaResult?.ok && <ModuleError message={uebaResult?.error || 'UEBA module failed.'} />}

      {report && uebaResult?.ok && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBox label="User" value={uebaResult.data?.user} color="text-blue-400" />
            <StatBox label="Risk Level" badge={<StatusBadge status={uebaResult.data?.risk_level} />} />
            <StatBox label="Anomaly" badge={<StatusBadge status={anomaly ? 'detected' : 'safe'} />} />
            <StatBox label="Action" value={uebaResult.data?.input?.action} color="text-gray-300" />
          </div>

          <ProgressBar label="Risk Score" value={riskScore} />

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Access Count</p>
            <p className="text-white text-sm font-semibold">{uebaResult.data?.input?.access_count}</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-400 text-xs mb-1">Recommendations</p>
            <p className="text-gray-200 text-sm">{recommendations}</p>
          </div>

          <div
            className={`rounded-xl p-4 border ${
              anomaly ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'
            }`}
          >
            <p className={`text-sm ${anomaly ? 'text-red-400' : 'text-green-400'}`}>{uebaResult.data?.message}</p>
          </div>
        </div>
      )}

      {report && (
        <div className="border-t border-slate-800 pt-4">
          <h3 className="text-gray-300 font-semibold text-sm mb-3">Behavior Timeline</h3>
          {logsLoading ? (
            <Spinner label="Loading activity logs..." />
          ) : activities.length === 0 ? (
            <p className="text-gray-500 text-sm">No behavior records found for this user.</p>
          ) : (
            <div className="space-y-3">
              {activities.slice().reverse().map((a, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="text-white text-sm font-medium capitalize">{a.action}</p>
                    <p className="text-gray-500 text-xs">Access count: {a.access_count}</p>
                  </div>
                  <StatusBadge status={a.risk_level} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default UEBACard;
