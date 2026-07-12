import { useState } from 'react';
import { documentFeatures } from '../../services/api';

function RiskPage() {
  const [userRole, setUserRole] = useState('employee');
  const [riskLevel, setRiskLevel] = useState('low');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await documentFeatures.accessCheck(userRole, riskLevel);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Access check failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen p-8">
      <h1 className="text-white text-4xl font-bold mb-8">Risk & Access Control</h1>
      <div className="max-w-2xl">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-6">
          <h2 className="text-white text-lg font-bold mb-4">Access Control Check</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">User Role</label>
              <select value={userRole} onChange={(e) => setUserRole(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500">
                <option value="viewer">Viewer</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Risk Level</label>
              <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <button onClick={handleCheck} disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Checking...' : 'Check Access'}
          </button>
        </div>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">{error}</div>
        )}
        {result && (
          <div className={`rounded-2xl p-6 border ${
            result.access === 'Granted' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`text-5xl font-bold ${result.access === 'Granted' ? 'text-green-400' : 'text-red-400'}`}>
                {result.access}
              </div>
              <div>
                <p className="text-gray-400">Role: <span className="text-white">{result.role}</span></p>
                <p className="text-gray-400">Risk Level: <span className="text-white">{result.risk_level}</span></p>
              </div>
            </div>
          </div>
        )}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mt-6">
          <h2 className="text-white text-lg font-bold mb-4">Access Control Matrix</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-gray-400 py-3">Role</th>
                <th className="text-center text-green-400 py-3">Low Risk</th>
                <th className="text-center text-amber-400 py-3">Medium Risk</th>
                <th className="text-center text-red-400 py-3">High Risk</th>
              </tr>
            </thead>
            <tbody>
              {['viewer', 'employee', 'manager', 'admin'].map((role) => (
                <tr key={role} className="border-b border-slate-800/50">
                  <td className="text-white py-3 capitalize">{role}</td>
                  <td className="text-center py-3 text-green-400">✓</td>
                  <td className="text-center py-3">
                    {['manager', 'admin'].includes(role) ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>}
                  </td>
                  <td className="text-center py-3">
                    {role === 'admin' ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RiskPage;
