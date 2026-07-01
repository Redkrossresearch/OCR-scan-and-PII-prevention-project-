import React, { useState } from 'react';
import { ScrollText, Filter, Download, AlertTriangle, CheckCircle, Eye, Upload, Trash2, Edit2 } from 'lucide-react';
import './AuditLogs.css';

const allLogs = [
  { id: 1, time: '09:42:15', user: 'Arjun Mehta',  action: 'File Scanned',     target: 'employee_data.pdf', result: 'Critical',  icon: AlertTriangle, color: 'red' },
  { id: 2, time: '09:38:02', user: 'Priya Sharma',  action: 'Report Downloaded', target: 'june_report.pdf',  result: 'Success',   icon: Download,     color: 'green' },
  { id: 3, time: '09:30:44', user: 'Rohan Verma',   action: 'File Uploaded',     target: 'invoice.jpg',      result: 'High Risk', icon: Upload,       color: 'amber' },
  { id: 4, time: '09:22:11', user: 'Sneha Patel',   action: 'PII Redacted',      target: 'contracts.docx',   result: 'Success',   icon: CheckCircle,  color: 'green' },
  { id: 5, time: '09:15:58', user: 'Karan Singh',   action: 'User Viewed',       target: 'dashboard',        result: 'Normal',    icon: Eye,          color: 'cyan' },
  { id: 6, time: '09:10:33', user: 'Neha Joshi',    action: 'File Deleted',      target: 'temp_data.csv',    result: 'Warning',   icon: Trash2,       color: 'amber' },
  { id: 7, time: '09:05:20', user: 'Arjun Mehta',  action: 'Policy Updated',    target: 'DLP Policy v2',    result: 'Success',   icon: Edit2,        color: 'cyan' },
  { id: 8, time: '08:58:44', user: 'Priya Sharma',  action: 'File Scanned',     target: 'payroll.xlsx',     result: 'Medium',    icon: AlertTriangle, color: 'amber' },
];

const colorMap = {
  red: 'badge-red', amber: 'badge-amber', green: 'badge-green', cyan: 'badge-cyan'
};

export default function AuditLogs() {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Scans', 'Downloads', 'Uploads', 'Redactions'];

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Audit Logs</h1>
            <p className="page-sub">Complete activity trail for compliance and forensic investigation</p>
          </div>
          <button className="btn btn-outline">
            <Download size={16} /> Export Logs
          </button>
        </div>

        <div className="audit-toolbar">
          <div className="tab-group">
            {filters.map(f => (
              <button key={f} className={`tab-btn ${filter === f ? 'tab-btn--active' : ''}`}
                onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <button className="btn btn-ghost" style={{ fontSize: 13, padding: '8px 14px' }}>
            <Filter size={14} /> Advanced Filter
          </button>
        </div>

        <div className="card">
          <div className="audit-list">
            {allLogs.map(log => {
              const Icon = log.icon;
              return (
                <div key={log.id} className="audit-item">
                  <div className={`audit-item__icon audit-item__icon--${log.color}`}>
                    <Icon size={15} />
                  </div>
                  <div className="audit-item__time">{log.time}</div>
                  <div className="audit-item__body">
                    <span className="audit-item__user">{log.user}</span>
                    <span className="audit-item__action">{log.action}</span>
                    <span className="audit-item__target">→ {log.target}</span>
                  </div>
                  <span className={`badge ${colorMap[log.color]}`}>{log.result}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
