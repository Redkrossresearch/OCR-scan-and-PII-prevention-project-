import { useId } from 'react';
import { Link } from 'react-router-dom';

export function Card({ title, subtitle, icon, children, className = '' }) {
  return (
    <div className={`dli-panel p-5 md:p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800/60">
        {icon && (
          <span className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-lg">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-white text-base md:text-lg font-semibold leading-snug truncate">{title}</h2>
          {subtitle && <p className="text-slate-500 text-xs mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3 text-slate-400 py-4">
      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Message({ type = 'success', children }) {
  const styles =
    type === 'error'
      ? 'bg-red-500/10 border-red-500/30 text-red-400'
      : type === 'info'
      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
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
    critical: 'bg-rose-600/20 text-rose-300 border-rose-600/40',
    high: 'bg-red-500/10 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-green-500/10 text-green-400 border-green-500/30',
    safe: 'bg-green-500/10 text-green-400 border-green-500/30',
    detected: 'bg-red-500/10 text-red-400 border-red-500/30',
    unsupported: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    watermark: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    granted: 'bg-green-500/10 text-green-400 border-green-500/30',
    error: 'bg-red-500/10 text-red-400 border-red-500/30',
  };
  const key = String(status).toLowerCase();
  const cls = map[key] || 'bg-slate-500/10 text-slate-300 border-slate-500/30';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap ${cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {status}
    </span>
  );
}

export function ProgressBar({ value, label }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const color = pct > 70 ? 'bg-red-500' : pct > 40 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-400">{label}</span>
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
    <div className={`bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/50 text-center min-w-0 ${className}`}>
      <p className="text-slate-500 text-[11px] uppercase tracking-wide mb-1.5 truncate" title={label}>
        {label}
      </p>
      {badge ? (
        <div className="flex justify-center">{badge}</div>
      ) : (
        <p className={`text-lg md:text-xl font-bold leading-snug break-words ${color}`}>{value}</p>
      )}
    </div>
  );
}

export function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-slate-400 text-sm mb-2">{label}</label>}
      <input
        {...props}
        className="w-full bg-slate-800/70 border border-slate-700/70 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
      />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-slate-400 text-sm mb-2">{label}</label>}
      <select
        {...props}
        className="w-full bg-slate-800/70 border border-slate-700/70 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
      >
        {children}
      </select>
    </div>
  );
}

export function TextArea({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-slate-400 text-sm mb-2">{label}</label>}
      <textarea
        {...props}
        className="w-full bg-slate-800/70 border border-slate-700/70 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors resize-y"
      />
    </div>
  );
}

export function FileInput({ label, onChange, file }) {
  const inputId = useId();
  return (
    <div>
      {label && <label className="block text-slate-400 text-sm mb-2">{label}</label>}
      <label
        htmlFor={inputId}
        className="block w-full bg-slate-800/70 border border-dashed border-slate-600 hover:border-indigo-500 rounded-xl px-4 py-4 text-center cursor-pointer transition-colors"
      >
        <input id={inputId} type="file" onChange={onChange} className="hidden" />
        {file ? (
          <span className="text-white text-sm break-words">{file.name}</span>
        ) : (
          <span className="text-slate-400 text-sm">Click to upload a file</span>
        )}
      </label>
    </div>
  );
}

export function EmptyAnalysis({ message }) {
  return (
    <div className="text-center py-10">
      <p className="text-slate-500 text-sm mb-5">
        {message || 'No document has been analyzed yet.'}
      </p>
      <Link
        to="/ocr"
        className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
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
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-800/50 last:border-0">
      <span className="text-slate-500 text-sm shrink-0">{label}</span>
      <span className={`${valueClass} text-sm text-right min-w-0 break-words`}>{value || '—'}</span>
    </div>
  );
}