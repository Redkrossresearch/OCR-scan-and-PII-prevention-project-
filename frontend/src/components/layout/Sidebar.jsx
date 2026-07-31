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
} from "react-icons/fa";

function Sidebar() {
  const menuStyle = ({ isActive }) =>
    `flex items-center gap-4 p-4 rounded-xl transition-all duration-300 mb-2 ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <div className="w-64 h-screen bg-slate-950 border-r border-slate-800 p-5">

      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          🔐 AI DLP System
        </h1>
      </div>

      {/* Menu */}
      <nav>

        <NavLink to="/" className={menuStyle}>
          <FaHome size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/upload" className={menuStyle}>
          <FaUpload size={20} />
          <span>Upload</span>
        </NavLink>

        <NavLink to="/ocr" className={menuStyle}>
          <FaSearch size={20} />
          <span>OCR</span>
        </NavLink>

        <NavLink to="/detection" className={menuStyle}>
          <FaShieldAlt size={20} />
          <span>Detection</span>
        </NavLink>

        <NavLink to="/risk" className={menuStyle}>
          <FaExclamationTriangle size={20} />
          <span>Risk</span>
        </NavLink>

        <NavLink to="/audit" className={menuStyle}>
          <FaClipboardList size={20} />
          <span>Audit</span>
        </NavLink>

        <NavLink to="/reports" className={menuStyle}>
          <FaFileAlt size={20} />
          <span>Reports</span>
        </NavLink>

        <NavLink to="/dlp-controls" className={menuStyle}>
          <FaUserShield size={20} />
          <span>DLP Controls</span>
        </NavLink>

        <NavLink to="/ai-behavior" className={menuStyle}>
          <FaBrain size={20} />
          <span>AI & Behavior</span>
        </NavLink>

      </nav>
    </div>
  );
}

export default Sidebar;
