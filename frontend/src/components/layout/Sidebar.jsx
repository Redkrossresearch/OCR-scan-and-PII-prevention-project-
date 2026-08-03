import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaUpload,
  FaSearch,
  FaShieldAlt,
  FaExclamationTriangle,
  FaClipboardList,
  FaFileAlt,
  FaUserShield,
  FaBrain,
  FaVideo,
} from "react-icons/fa";

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { to: "/", icon: FaHome, text: "Dashboard" },
      { to: "/upload", icon: FaUpload, text: "Upload" },
      { to: "/ocr", icon: FaSearch, text: "OCR" },
    ],
  },
  {
    label: "Analysis",
    items: [
      { to: "/detection", icon: FaShieldAlt, text: "Detection" },
      { to: "/risk", icon: FaExclamationTriangle, text: "Risk" },
    ],
  },
  {
    label: "Governance",
    items: [
      { to: "/audit", icon: FaClipboardList, text: "Audit" },
      { to: "/reports", icon: FaFileAlt, text: "Reports" },
    ],
  },
  {
    label: "Security",
    items: [
      { to: "/dlp-controls", icon: FaUserShield, text: "DLP Controls" },
      { to: "/ai-behavior", icon: FaBrain, text: "AI & Behavior" },
      { to: "/forensic-sessions", icon: FaVideo, text: "Forensic" },
    ],
  },
];

function Sidebar() {
  const menuStyle = ({ isActive }) =>
    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
      isActive
        ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-white border-indigo-500/30 shadow-sm shadow-indigo-950/40"
        : "text-slate-400 hover:text-white hover:bg-slate-800/60 border-transparent"
    }`;

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 z-30 flex flex-col bg-[#0d1424] border-r border-slate-800/70">

      {/* Logo */}
      <div className="px-5 py-6 border-b border-slate-800/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-950/50">
            🔐
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold text-white leading-tight">
              AI DLP System
            </h1>
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-500 truncate">
              Data Loss Prevention
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink key={item.to} to={item.to} className={menuStyle} end={item.to === "/"}>
                  <item.icon size={17} className="shrink-0 transition-colors group-hover:text-indigo-300" />
                  <span className="truncate">{item.text}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-800/70">
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-2.5">
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-500">Version</p>
          <p className="text-xs text-slate-300 mt-0.5">OCR DLP · v1.0.0</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
