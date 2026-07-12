import { useState, useEffect } from 'react';
import { documentFeatures, forensic } from '../../services/api';

function AuditPage() {
  const [internalLogs, setInternalLogs] = useState([]);
  const [forensicLogs, setForensicLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState('internal');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const [intData, foreData] = await Promise.allSettled([
        documentFeatures.auditLogs(),
        forensic.logs(),
      ]);
      if (intData.status === 'fulfilled') setInternalLogs(intData.value.logs || []);
      if (foreData.status === 'fulfilled') setForensicLogs(foreData.value.records || foreData.value.logs || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const logs = activeTab === 'internal' ? internalLogs : forensicLogs;
  const filteredLogs = logs.filter((log) =>
    filter === '' ||
    log.user?.toLowerCase().includes(filter.toLowerCase()) ||
    log.action?.toLowerCase().includes(filter.toLowerCase()) ||
    log.document?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-slate-950 min-h-screen p-8">
      <h1 className="text-white text-4xl font-bold mb-8">Audit Logs</h1>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex border border-slate-800 rounded-xl overflow-hidden">
          <button onClick={() => setActiveTab('internal')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === 'internal' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-gray-400 hover:text-white'}`}>
            Internal Audit
          </button>
          <button onClick={() => setActiveTab('forensic')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === 'forensic' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-gray-400 hover:text-white'}`}>
            Forensic Logs
          </button>
        </div>
        <input type="text" placeholder="Filter logs..." value={filter} onChange={(e) => setFilter(e.target.value)}
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
                  <th className="text-left text-gray-400 py-3 px-6 text-sm">Document</th>
                  <th className="text-left text-gray-400 py-3 px-6 text-sm">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="text-gray-500 py-3 px-6">{i + 1}</td>
                    <td className="text-white py-3 px-6">{log.user}</td>
                    <td className="py-3 px-6">
                      <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-sm">{log.action}</span>
                    </td>
                    <td className="text-gray-300 py-3 px-6">{log.document}</td>
                    <td className="text-gray-500 py-3 px-6 text-sm">{log.timestamp || log.created_at}</td>
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
