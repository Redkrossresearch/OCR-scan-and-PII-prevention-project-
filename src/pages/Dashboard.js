import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Shield, AlertTriangle, FileText, Eye, TrendingUp,
  Activity, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import './Dashboard.css';

const areaData = [
  { day: 'Mon', scans: 42, violations: 8 },
  { day: 'Tue', scans: 68, violations: 14 },
  { day: 'Wed', scans: 55, violations: 6 },
  { day: 'Thu', scans: 91, violations: 21 },
  { day: 'Fri', scans: 74, violations: 17 },
  { day: 'Sat', scans: 30, violations: 5 },
  { day: 'Sun', scans: 48, violations: 9 },
];

const riskData = [
  { name: 'Critical', value: 12, color: '#ef4444' },
  { name: 'High',     value: 28, color: '#f59e0b' },
  { name: 'Medium',   value: 45, color: '#3b82f6' },
  { name: 'Low',      value: 90, color: '#22c55e' },
];

const piiData = [
  { name: 'Aadhaar', count: 54 },
  { name: 'PAN',     count: 38 },
  { name: 'Email',   count: 92 },
  { name: 'Phone',   count: 71 },
  { name: 'Credit Card', count: 23 },
  { name: 'Passport', count: 11 },
];

const recentScans = [
  { file: 'employee_data.pdf',   risk: 'Critical', pii: 'Aadhaar, PAN',  time: '2 min ago',  status: 'flagged' },
  { file: 'invoice_march.jpg',   risk: 'High',     pii: 'Credit Card',   time: '11 min ago', status: 'flagged' },
  { file: 'report_q1.docx',      risk: 'Medium',   pii: 'Email, Phone',  time: '24 min ago', status: 'flagged' },
  { file: 'public_notice.txt',   risk: 'Low',      pii: 'None',          time: '1 hr ago',   status: 'clean' },
  { file: 'hr_contracts.pdf',    risk: 'Critical', pii: 'Aadhaar, Bank', time: '2 hr ago',   status: 'flagged' },
  { file: 'product_catalog.png', risk: 'Low',      pii: 'None',          time: '3 hr ago',   status: 'clean' },
];

const kpiCards = [
  { label: 'Total Files Scanned', value: '1,284', icon: FileText, trend: '+12%', trendUp: true,  color: 'cyan' },
  { label: 'Policy Violations',   value: '80',    icon: AlertTriangle, trend: '-5%', trendUp: false, color: 'red' },
  { label: 'PII Detected',        value: '289',   icon: Eye, trend: '+8%', trendUp: true,  color: 'amber' },
  { label: 'Files Redacted',      value: '47',    icon: Shield, trend: '+22%', trendUp: true, color: 'green' },
];

const riskBadge = { Critical: 'badge-red', High: 'badge-amber', Medium: 'badge badge-cyan', Low: 'badge-green' };

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('week');

  return (
    <div className="page dashboard">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Security Dashboard</h1>
            <p className="page-sub">Real-time overview of your DLP operations</p>
          </div>
          <div className="page-header__actions">
            <div className="live-pill">
              <span className="live-dot" />
              Live Monitoring
            </div>
            <div className="tab-group">
              {['day','week','month'].map(t => (
                <button key={t} className={`tab-btn ${activeTab === t ? 'tab-btn--active' : ''}`}
                  onClick={() => setActiveTab(t)}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid-4 mb-32">
          {kpiCards.map(({ label, value, icon: Icon, trend, trendUp, color }) => (
            <div key={label} className={`kpi-card card kpi-card--${color}`}>
              <div className="kpi-card__top">
                <span className="kpi-card__label">{label}</span>
                <div className="kpi-card__icon"><Icon size={20} /></div>
              </div>
              <div className="kpi-card__value">{value}</div>
              <div className={`kpi-card__trend ${trendUp ? 'kpi-card__trend--up' : 'kpi-card__trend--down'}`}>
                <TrendingUp size={12} />
                {trend} vs last week
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="charts-row mb-32">
          {/* Area chart */}
          <div className="card chart-card">
            <div className="chart-card__header">
              <div>
                <h3>Scan Activity</h3>
                <p>Files scanned vs policy violations this week</p>
              </div>
              <Activity size={18} style={{ color: 'var(--cyan-400)' }} />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="violGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid #1e2d55', borderRadius: 8, color: '#f1f5f9' }} />
                <Legend />
                <Area type="monotone" dataKey="scans"      stroke="#06b6d4" fill="url(#scanGrad)" strokeWidth={2} name="Scans" />
                <Area type="monotone" dataKey="violations" stroke="#ef4444" fill="url(#violGrad)" strokeWidth={2} name="Violations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="card chart-card chart-card--sm">
            <div className="chart-card__header">
              <div>
                <h3>Risk Distribution</h3>
                <p>Breakdown by severity level</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {riskData.map(({ color }, i) => <Cell key={i} fill={color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid #1e2d55', borderRadius: 8, color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {riskData.map(({ name, value, color }) => (
                <div key={name} className="pie-legend__item">
                  <span className="pie-legend__dot" style={{ background: color }} />
                  <span>{name}</span>
                  <span className="pie-legend__count">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar chart + recent scans */}
        <div className="charts-row mb-32">
          <div className="card chart-card">
            <div className="chart-card__header">
              <div>
                <h3>PII Type Frequency</h3>
                <p>Most commonly detected sensitive data types</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={piiData} barSize={28}>
                <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#475569', fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid #1e2d55', borderRadius: 8, color: '#f1f5f9' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[4,4,0,0]} name="Detected" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent scans */}
          <div className="card">
            <div className="chart-card__header">
              <div>
                <h3>Recent Scans</h3>
                <p>Latest file scan results</p>
              </div>
              <Clock size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="recent-list">
              {recentScans.map((s, i) => (
                <div key={i} className="recent-item">
                  <div className="recent-item__left">
                    <div className={`recent-item__status ${s.status === 'clean' ? 'recent-item__status--clean' : 'recent-item__status--flagged'}`}>
                      {s.status === 'clean' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    </div>
                    <div>
                      <div className="recent-item__file">{s.file}</div>
                      <div className="recent-item__pii">{s.pii === 'None' ? '—' : s.pii}</div>
                    </div>
                  </div>
                  <div className="recent-item__right">
                    <span className={`badge ${s.risk === 'Critical' ? 'badge-red' : s.risk === 'High' ? 'badge-amber' : s.risk === 'Low' ? 'badge-green' : 'badge-cyan'}`}>
                      {s.risk}
                    </span>
                    <span className="recent-item__time">{s.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
