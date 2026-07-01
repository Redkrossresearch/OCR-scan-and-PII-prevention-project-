import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, ScanSearch, FileBarChart2, Users, ScrollText, Settings, Menu, X, Bell, ChevronDown } from 'lucide-react';
import './Navbar.css';

const navLinks = [
  { path: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/scan',      label: 'File Scanner', icon: ScanSearch },
  { path: '/reports',   label: 'Reports',      icon: FileBarChart2 },
  { path: '/users',     label: 'Users',        icon: Users },
  { path: '/audit',     label: 'Audit Logs',   icon: ScrollText },
  { path: '/settings',  label: 'Settings',     icon: Settings },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <Shield size={22} className="navbar__logo-icon" />
          <span className="navbar__logo-text">
            Shield<span className="navbar__logo-accent">Scan</span>
          </span>
          <span className="navbar__logo-tag">DLP</span>
        </Link>

        {/* Desktop nav */}
        <ul className="navbar__links">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <Link
                to={path}
                className={`navbar__link ${location.pathname === path ? 'navbar__link--active' : ''}`}
              >
                <Icon size={15} />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="navbar__actions">
          <button className="navbar__icon-btn" aria-label="Notifications">
            <Bell size={18} />
            <span className="navbar__notif-dot" />
          </button>
          <div className="navbar__user">
            <div className="navbar__avatar">A</div>
            <span className="navbar__user-name">Admin</span>
            <ChevronDown size={14} />
          </div>
        </div>

        {/* Mobile toggle */}
        <button className="navbar__toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="navbar__mobile">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`navbar__mobile-link ${location.pathname === path ? 'navbar__mobile-link--active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
