import { useState, useEffect } from 'react';
import { documentFeatures, audit } from '../../services/api';

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
          setAuditLogs(logData.value.logs.slice(-5).reverse());
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
    <div className="bg-slate-950 min-h-screen p-8">
      <h1 className="text-white text-4xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <p className="text-gray-400">Total Documents</p>
          <h1 className="text-blue-400 text-4xl mt-2">{stats.total_documents}</h1>
        </div>
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <p className="text-gray-400">High Risk</p>
          <h1 className="text-red-400 text-4xl mt-2">{stats.risk_documents}</h1>
        </div>
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <p className="text-gray-400">Watermark Detected</p>
          <h1 className="text-cyan-400 text-4xl mt-2">{stats.watermark_detected}</h1>
        </div>
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <p className="text-gray-400">Tampered Docs</p>
          <h1 className="text-amber-400 text-4xl mt-2">{stats.tampered_documents}</h1>
        </div>
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <p className="text-gray-400">Classified</p>
          <h1 className="text-green-400 text-4xl mt-2">{stats.classified_documents}</h1>
        </div>
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <p className="text-gray-400">Expired</p>
          <h1 className="text-purple-400 text-4xl mt-2">{stats.expired_documents}</h1>
        </div>
      </div>
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <h2 className="text-white text-xl font-bold mb-4">Recent Activity</h2>
        {auditLogs.length === 0 ? (
          <p className="text-gray-500">No recent activity. Upload a document to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-gray-400 py-3 px-4 text-sm">User</th>
                  <th className="text-left text-gray-400 py-3 px-4 text-sm">Action</th>
                  <th className="text-left text-gray-400 py-3 px-4 text-sm">Details</th>
                  <th className="text-left text-gray-400 py-3 px-4 text-sm">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log, i) => (
                  <tr key={log.id ?? i} className="border-b border-slate-800/50">
                    <td className="text-white py-3 px-4">{log.user}</td>
                    <td className="text-gray-300 py-3 px-4">{log.action}</td>
                    <td className="text-gray-300 py-3 px-4 text-sm">{log.details || log.document}</td>
                    <td className="text-gray-500 py-3 px-4 text-sm">{log.created_at || log.timestamp}</td>
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
