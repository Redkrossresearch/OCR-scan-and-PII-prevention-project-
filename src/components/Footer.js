import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Github, Linkedin, Mail } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="footer__logo">
              <Shield size={20} className="footer__logo-icon" />
              <span>Shield<span>Scan</span> DLP</span>
            </div>
            <p className="footer__tagline">
              Enterprise-grade AI data loss prevention. Protect what matters most.
            </p>
            <div className="footer__socials">
              <a href="#" aria-label="GitHub"><Github size={18} /></a>
              <a href="#" aria-label="LinkedIn"><Linkedin size={18} /></a>
              <a href="#" aria-label="Email"><Mail size={18} /></a>
            </div>
          </div>

          <div className="footer__col">
            <h4>Platform</h4>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/scan">File Scanner</Link>
            <Link to="/reports">Reports</Link>
            <Link to="/audit">Audit Logs</Link>
          </div>

          <div className="footer__col">
            <h4>Security</h4>
            <Link to="/users">User Management</Link>
            <Link to="/settings">Policy Settings</Link>
            <a href="#">Access Control</a>
            <a href="#">Compliance</a>
          </div>

          <div className="footer__col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Documentation</a>
            <a href="#">Support</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} ShieldScan DLP. All rights reserved.</p>
          <p>Built for enterprise data security.</p>
        </div>
      </div>
    </footer>
  );
}
