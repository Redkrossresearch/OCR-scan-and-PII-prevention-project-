import { useState, useEffect } from 'react';
import { documentFeatures, audit } from '../../services/api';

const STAT_CARDS = [
  { key: 'total_documents', label: 'Total Documents', icon: '📄', valueClass: 'text-indigo-400' },
  { key: 'risk_documents', label: 'High Risk', icon: '⚠️', valueClass: 'text-red-400' },
  { key: 'watermark_detected', label: 'Watermark Detected', icon: '💧', valueClass: 'text-cyan-400' },
  { key: 'tampered_documents', label: 'Tampered Docs', icon: '🔧', valueClass: 'text-amber-400' },
  { key: 'classified_documents', label: 'Classified', icon: '🏷️', valueClass: 'text-green-400' },
  { key: 'expired_documents', label: 'Expired', icon: '⏳', valueClass: 'text-purple-400' },
];

function Dashboard() {
  const [stats, setStats] = useState({
    total_documents: 0, classified_documents: 0, watermark_detected: 0,
    tampered_documents: 0, risk_documents: 0, expired_documents: 0,
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([documentFeatures.dashboard(), audit.logs()])
      .then(([dashData, logData]) => {
        if (cancelled) return;
        if (dashData.status === 'fulfilled' && dashData.value.dashboard) {
          setStats(dashData.value.dashboard);
        }
        if (logData.status === 'fulfilled' && logData.value.logs) {
          setAuditLogs(logData.value.logs.slice(0, 5));
        }
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to load dashboard:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen p-4 sm:p-6 lg:p-8">
      <h1 className="font-display text-white text-2xl md:text-3xl font-semibold mb-2">Dashboard</h1>
      <p className="text-slate-500 mb-8">Overview of your document security posture.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="dli-panel p-5 flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-center text-2xl">
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide truncate">{card.label}</p>
              <p className={`text-3xl font-bold mt-1 ${card.valueClass}`}>{stats[card.key]}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dli-panel p-5 md:p-6">
        <h2 className="text-white text-lg font-semibold mb-4">Recent Activity</h2>
        {auditLogs.length === 0 ? (
          <p className="text-slate-500">No recent activity. Upload a document to get started.</p>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide py-3 px-4">User</th>
                  <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide py-3 px-4">Action</th>
                  <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide py-3 px-4">Details</th>
                  <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log, i) => (
                  <tr key={log.id ?? i} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                    <td className="text-white py-3 px-4 break-words">{log.user}</td>
                    <td className="text-slate-300 py-3 px-4 break-words">{log.action}</td>
                    <td className="text-slate-400 py-3 px-4 text-sm break-words">{log.details || log.document}</td>
                    <td className="text-slate-500 py-3 px-4 text-sm whitespace-nowrap">{log.created_at || log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
