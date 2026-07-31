import { useId } from 'react';
import { Link } from 'react-router-dom';

export function Card({ title, subtitle, icon, children, className = '' }) {
  return (
    <div className={`bg-slate-900 rounded-2xl p-6 border border-slate-800 ${className}`}>
      <div className="flex items-center gap-3 mb-5">
        {icon && <span className="text-blue-400 text-xl">{icon}</span>}
        <div>
          <h2 className="text-white text-lg font-bold">{title}</h2>
          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3 text-gray-400 py-4">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Message({ type = 'success', children }) {
  const styles =
    type === 'error'
      ? 'bg-red-500/10 border-red-500/30 text-red-400'
      : type === 'info'
      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
      : 'bg-green-500/10 border-green-500/30 text-green-400';
  return (
    <div className={`${styles} border px-4 py-3 rounded-xl text-sm mb-4`}>{children}</div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    allowed: 'bg-green-500/10 text-green-400 border-green-500/30',
    blocked: 'bg-red-500/10 text-red-400 border-red-500/30',
    denied: 'bg-red-500/10 text-red-400 border-red-500/30',
    active: 'bg-green-500/10 text-green-400 border-green-500/30',
    inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    disabled: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    enabled: 'bg-green-500/10 text-green-400 border-green-500/30',
    high: 'bg-red-500/10 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-green-500/10 text-green-400 border-green-500/30',
    safe: 'bg-green-500/10 text-green-400 border-green-500/30',
    detected: 'bg-red-500/10 text-red-400 border-red-500/30',
    unsupported: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    watermark: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };
  const key = String(status).toLowerCase();
  const cls = map[key] || 'bg-slate-500/10 text-gray-300 border-slate-500/30';
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold capitalize ${cls}`}
    >
      {status}
    </span>
  );
}

export function ProgressBar({ value, label }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const color = pct > 70 ? 'bg-red-500' : pct > 40 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">{pct}%</span>
      </div>
      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function StatBox({ label, value, color = 'text-white', badge, className = '' }) {
  return (
    <div className={`bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 text-center ${className}`}>
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {badge ? (
        <div className="flex justify-center">{badge}</div>
      ) : (
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      )}
    </div>
  );
}

export function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-gray-400 text-sm mb-2">{label}</label>}
      <input
        {...props}
        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-gray-400 text-sm mb-2">{label}</label>}
      <select
        {...props}
        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
      >
        {children}
      </select>
    </div>
  );
}

export function TextArea({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-gray-400 text-sm mb-2">{label}</label>}
      <textarea
        {...props}
        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 resize-y"
      />
    </div>
  );
}

export function FileInput({ label, onChange, file }) {
  const inputId = useId();
  return (
    <div>
      {label && <label className="block text-gray-400 text-sm mb-2">{label}</label>}
      <label
        htmlFor={inputId}
        className="block w-full bg-slate-800 border border-dashed border-slate-600 hover:border-blue-500 rounded-xl px-4 py-4 text-center cursor-pointer transition-colors"
      >
        <input
          id={inputId}
          type="file"
          onChange={onChange}
          className="hidden"
        />
        {file ? (
          <span className="text-white text-sm">{file.name}</span>
        ) : (
          <span className="text-gray-400 text-sm">Click to upload a file</span>
        )}
      </label>
    </div>
  );
}

export function EmptyAnalysis({ message }) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500 text-sm mb-4">
        {message || 'No document has been analyzed yet.'}
      </p>
      <Link
        to="/ocr"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
      >
        Analyze a Document
      </Link>
    </div>
  );
}

export function ModuleError({ message }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
      {message || 'This module could not be evaluated.'}
    </div>
  );
}

export function KeyValue({ label, value, valueClass = 'text-white' }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0 gap-4">
      <span className="text-gray-400 text-sm shrink-0">{label}</span>
      <span className={`${valueClass} text-sm text-right break-all`}>{value || '—'}</span>
    </div>
  );
}
