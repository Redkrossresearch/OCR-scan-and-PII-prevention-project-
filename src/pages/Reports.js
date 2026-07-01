import React, { useState } from 'react';
import { FileBarChart2, Download, Calendar, Filter, RefreshCw, FileText, FileSpreadsheet } from 'lucide-react';
import './Reports.css';

const reports = [
  { id: 1, name: 'Daily Compliance Report',    date: '2024-06-28', type: 'Compliance', files: 142, violations: 12, status: 'Ready' },
  { id: 2, name: 'Weekly PII Summary',          date: '2024-06-25', type: 'PII',        files: 891, violations: 78, status: 'Ready' },
  { id: 3, name: 'Monthly Risk Assessment',     date: '2024-06-01', type: 'Risk',       files: 3204, violations: 267, status: 'Ready' },
  { id: 4, name: 'User Activity Audit',         date: '2024-06-27', type: 'Audit',      files: 56, violations: 3, status: 'Ready' },
  { id: 5, name: 'Critical Incidents Report',   date: '2024-06-26', type: 'Incident',   files: 8, violations: 8, status: 'Ready' },
  { id: 6, name: 'June Scheduled Report',       date: '2024-06-30', type: 'Scheduled',  files: 0, violations: 0, status: 'Pending' },
];

const typeColor = {
  Compliance: 'badge-cyan', PII: 'badge-amber', Risk: 'badge-red',
  Audit: 'badge-green', Incident: 'badge-red', Scheduled: 'badge badge-cyan',
};

export default function Reports() {
  const [filter, setFilter] = useState('All');
  const types = ['All', 'Compliance', 'PII', 'Risk', 'Audit', 'Incident'];
  const filtered = filter === 'All' ? reports : reports.filter(r => r.type === filter);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Reports</h1>
            <p className="page-sub">Generate and download compliance and security reports</p>
          </div>
          <button className="btn btn-primary">
            <RefreshCw size={16} /> Generate New Report
          </button>
        </div>

        {/* Quick generate cards */}
        <div className="grid-3 mb-32">
          {[
            { icon: FileText, label: 'PDF Report', sub: 'Full compliance report as PDF', fmt: 'PDF' },
            { icon: FileSpreadsheet, label: 'Excel Export', sub: 'Data export with all scan details', fmt: 'XLSX' },
            { icon: FileBarChart2, label: 'CSV Data', sub: 'Raw data for custom analysis', fmt: 'CSV' },
          ].map(({ icon: Icon, label, sub, fmt }) => (
            <div key={fmt} className="card report-export-card">
              <Icon size={28} style={{ color: 'var(--cyan-400)', marginBottom: 12 }} />
              <h3>{label}</h3>
              <p>{sub}</p>
              <button className="btn btn-outline" style={{ marginTop: 16, width: '100%' }}>
                <Download size={14} /> Download {fmt}
              </button>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="reports-toolbar">
          <div className="tab-group">
            {types.map(t => (
              <button key={t} className={`tab-btn ${filter === t ? 'tab-btn--active' : ''}`}
                onClick={() => setFilter(t)}>{t}</button>
            ))}
          </div>
          <button className="btn btn-ghost">
            <Calendar size={15} /> Date Range
          </button>
        </div>

        {/* Reports table */}
        <div className="card">
          <table className="pii-table">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Type</th>
                <th>Date</th>
                <th>Files Scanned</th>
                <th>Violations</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.name}</td>
                  <td><span className={`badge ${typeColor[r.type]}`}>{r.type}</span></td>
                  <td>{r.date}</td>
                  <td>{r.files.toLocaleString()}</td>
                  <td style={{ color: r.violations > 0 ? 'var(--red-500)' : 'var(--green-400)' }}>
                    {r.violations}
                  </td>
                  <td>
                    <span className={`badge ${r.status === 'Ready' ? 'badge-green' : 'badge-amber'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status === 'Ready' && (
                      <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
                        <Download size={13} /> Download
                      </button>
                    )}
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
