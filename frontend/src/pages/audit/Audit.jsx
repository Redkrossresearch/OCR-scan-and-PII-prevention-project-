import { useState, useEffect, useCallback } from 'react';
import { audit, forensic } from '../../services/api';

function AuditPage() {
  const [internalLogs, setInternalLogs] = useState([]);
  const [forensicLogs, setForensicLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState('internal');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const [intData, foreData] = await Promise.allSettled([
        audit.logs(),
        forensic.logs(),
      ]);
      if (intData.status === 'fulfilled') setInternalLogs(intData.value.logs || []);
      if (foreData.status === 'fulfilled') setForensicLogs(foreData.value.records || foreData.value.logs || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([audit.logs(), forensic.logs()])
      .then(([intData, foreData]) => {
        if (cancelled) return;
        if (intData.status === 'fulfilled') setInternalLogs(intData.value.logs || []);
        if (foreData.status === 'fulfilled') setForensicLogs(foreData.value.records || foreData.value.logs || []);
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to load logs:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const logs = activeTab === 'internal' ? internalLogs : forensicLogs;
  const filteredLogs = logs.filter((log) => {
    const q = filter.toLowerCase();
    if (q === '') return true;
    return (
      (log.user || '')?.toLowerCase().includes(q) ||
      (log.action || '')?.toLowerCase().includes(q) ||
      (log.details || log.document || '')?.toLowerCase().includes(q)
    );
  });

  const actionColor = (action) => {
    const a = String(action || '').toLowerCase();
    if (a.includes('fail') || a.includes('reject') || a.includes('block')) return 'bg-red-500/10 text-red-400';
    if (a.includes('login') || a.includes('register') || a.includes('logout')) return 'bg-amber-500/10 text-amber-400';
    if (a.includes('export') || a.includes('report') || a.includes('generated')) return 'bg-purple-500/10 text-purple-400';
    if (a.includes('pii') || a.includes('upload') || a.includes('detect')) return 'bg-blue-500/10 text-blue-400';
    return 'bg-slate-500/10 text-slate-400';
  };

  return (
    <div className="bg-slate-950 min-h-screen p-8">
      <h1 className="text-white text-4xl font-bold mb-2">Audit Logs</h1>
      <p className="text-gray-500 mb-8">
        Persistent, timestamped trail of every important action across the platform.
      </p>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex border border-slate-800 rounded-xl overflow-hidden">
          <button onClick={() => setActiveTab('internal')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === 'internal' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-gray-400 hover:text-white'}`}>
            Internal Audit ({internalLogs.length})
          </button>
          <button onClick={() => setActiveTab('forensic')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === 'forensic' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-gray-400 hover:text-white'}`}>
            Forensic Logs ({forensicLogs.length})
          </button>
        </div>
        <input type="text" placeholder="Filter by user, action or detail..." value={filter} onChange={(e) => setFilter(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
        <button onClick={loadLogs}
          className="bg-slate-800 hover:bg-slate-700 text-gray-300 px-4 py-2.5 rounded-xl text-sm transition-colors">
          Refresh
        </button>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading logs...</div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No logs found.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-gray-400 py-3 px-6 text-sm">#</th>
                  <th className="text-left text-gray-400 py-3 px-6 text-sm">User</th>
                  <th className="text-left text-gray-400 py-3 px-6 text-sm">Action</th>
                  <th className="text-left text-gray-400 py-3 px-6 text-sm">Details</th>
                  <th className="text-left text-gray-400 py-3 px-6 text-sm">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, i) => (
                  <tr key={log.id ?? i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="text-gray-500 py-3 px-6">{i + 1}</td>
                    <td className="text-white py-3 px-6">{log.user}</td>
                    <td className="py-3 px-6">
                      <span className={`${actionColor(log.action)} px-3 py-1 rounded-lg text-sm`}>{log.action}</span>
                    </td>
                    <td className="text-gray-300 py-3 px-6 text-sm">{log.details || log.document}</td>
                    <td className="text-gray-500 py-3 px-6 text-sm whitespace-nowrap">{log.created_at || log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default AuditPage;
