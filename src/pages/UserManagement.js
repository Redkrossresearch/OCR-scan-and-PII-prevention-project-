import React, { useState } from 'react';
import { Users, Plus, Search, Edit2, Trash2, Shield, Eye, Lock } from 'lucide-react';
import './UserManagement.css';

const users = [
  { id: 1, name: 'Arjun Mehta',    email: 'arjun@company.in',   role: 'Admin',   dept: 'IT Security',    status: 'Active',   lastLogin: '2 min ago' },
  { id: 2, name: 'Priya Sharma',   email: 'priya@company.in',   role: 'Analyst', dept: 'Compliance',     status: 'Active',   lastLogin: '1 hr ago' },
  { id: 3, name: 'Rohan Verma',    email: 'rohan@company.in',   role: 'Viewer',  dept: 'HR',             status: 'Active',   lastLogin: '3 hr ago' },
  { id: 4, name: 'Sneha Patel',    email: 'sneha@company.in',   role: 'Analyst', dept: 'Legal',          status: 'Inactive', lastLogin: '2 days ago' },
  { id: 5, name: 'Karan Singh',    email: 'karan@company.in',   role: 'Viewer',  dept: 'Finance',        status: 'Active',   lastLogin: '5 hr ago' },
  { id: 6, name: 'Neha Joshi',     email: 'neha@company.in',    role: 'Admin',   dept: 'IT Security',    status: 'Active',   lastLogin: '1 day ago' },
];

const roleColor  = { Admin: 'badge-red', Analyst: 'badge-cyan', Viewer: 'badge-green' };
const roleIcon   = { Admin: Shield, Analyst: Eye, Viewer: Lock };

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-sub">Manage roles, permissions, and access control</p>
          </div>
          <button className="btn btn-primary">
            <Plus size={16} /> Add User
          </button>
        </div>

        {/* Stats */}
        <div className="grid-4 mb-32">
          {[
            { label: 'Total Users',    value: users.length,                              color: 'cyan' },
            { label: 'Admins',         value: users.filter(u=>u.role==='Admin').length,  color: 'red' },
            { label: 'Analysts',       value: users.filter(u=>u.role==='Analyst').length,color: 'amber' },
            { label: 'Active Now',     value: users.filter(u=>u.status==='Active').length,color: 'green' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`kpi-card card kpi-card--${color}`}>
              <div className="kpi-card__label">{label}</div>
              <div className="kpi-card__value">{value}</div>
            </div>
          ))}
        </div>

        {/* Search & table */}
        <div className="card">
          <div className="um-toolbar">
            <div className="um-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search users by name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 13, padding: '8px 16px' }}>
              Filter by Role
            </button>
          </div>

          <table className="pii-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const RoleIcon = roleIcon[u.role];
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="um-avatar">{u.name[0]}</div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${roleColor[u.role]}`}>
                        <RoleIcon size={11} /> {u.role}
                      </span>
                    </td>
                    <td>{u.dept}</td>
                    <td>
                      <span className={`badge ${u.status === 'Active' ? 'badge-green' : 'badge-amber'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.lastLogin}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="um-action-btn" title="Edit"><Edit2 size={14} /></button>
                        <button className="um-action-btn um-action-btn--danger" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
