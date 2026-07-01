import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, ScanSearch, Eye, AlertTriangle, Lock, FileText,
  BarChart3, Users, Database, Zap, CheckCircle, ArrowRight,
  Activity, Globe, Cpu
} from 'lucide-react';
import './Home.css';

const stats = [
  { value: '30+', label: 'Security Features', icon: Shield },
  { value: '99.8%', label: 'Detection Accuracy', icon: Eye },
  { value: '<2s', label: 'Scan Speed', icon: Zap },
  { value: '10+', label: 'File Types Supported', icon: FileText },
];

const features = [
  {
    icon: ScanSearch, title: 'OCR Text Extraction',
    desc: 'Extract text from scanned images, PDFs, and documents using advanced OCR engine.',
    badge: 'Core',
  },
  {
    icon: Eye, title: 'PII Detection',
    desc: 'Detect Aadhaar, PAN, Passport, Email, Phone, Credit Card numbers instantly.',
    badge: 'AI',
  },
  {
    icon: AlertTriangle, title: 'Automatic Risk Scoring',
    desc: 'Assign Low, Medium, High, or Critical risk scores based on detected sensitive data.',
    badge: 'Smart',
  },
  {
    icon: Lock, title: 'PII Masking & Redaction',
    desc: 'Hide or permanently redact sensitive information with one click.',
    badge: 'Action',
  },
  {
    icon: Database, title: 'Exact Data Matching',
    desc: 'Match uploaded data against stored confidential records for precision detection.',
    badge: 'Core',
  },
  {
    icon: BarChart3, title: 'Dashboard & Analytics',
    desc: 'Real-time document statistics, risk trends, and executive summaries.',
    badge: 'Insight',
  },
  {
    icon: FileText, title: 'Report Generation',
    desc: 'Export compliance reports in PDF, Excel, or CSV formats on demand.',
    badge: 'Export',
  },
  {
    icon: Users, title: 'User Management',
    desc: 'Role-based access control with complete audit trails for every user action.',
    badge: 'Control',
  },
  {
    icon: Activity, title: 'Behavioral Analytics',
    desc: 'Detect abnormal patterns like mass downloads or unusual access (UEBA).',
    badge: 'AI',
  },
];

const howItWorks = [
  {
    step: '01', icon: FileText,
    title: 'Upload File',
    desc: 'Upload any document — image, PDF, Word, or text. The system validates format and checks for threats.',
  },
  {
    step: '02', icon: Cpu,
    title: 'AI Scans & Extracts',
    desc: 'Our OCR engine extracts all text. AI models then classify and identify sensitive data patterns.',
  },
  {
    step: '03', icon: AlertTriangle,
    title: 'Risk Assessment',
    desc: 'Detected PII is scored by severity. Documents receive a classification label and risk level.',
  },
  {
    step: '04', icon: Shield,
    title: 'Take Action',
    desc: 'Redact, quarantine, alert admins, or export compliance reports — all within the platform.',
  },
];

const piiTypes = [
  'Aadhaar Number', 'PAN Card', 'Passport Number', 'Email Address',
  'Phone Number', 'Credit Card', 'Bank Account', 'SSN / TIN',
  'Date of Birth', 'IP Address', 'Medical Records', 'Custom Keywords',
];

export default function Home() {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg-grid" />
        <div className="hero__bg-glow" />
        <div className="container hero__content">
          <div className="badge badge-cyan hero__eyebrow">
            <Shield size={12} />
            AI-Powered Data Security
          </div>
          <h1 className="hero__headline">
            Stop Data Leaks.<br />
            <span className="hero__headline-accent">Before They Happen.</span>
          </h1>
          <p className="hero__sub">
            ShieldScan DLP scans files, images, and documents using OCR and AI to detect, 
            classify, and protect sensitive information — Aadhaar, PAN, emails, and more.
          </p>
          <div className="hero__ctas">
            <Link to="/scan" className="btn btn-primary hero__cta-main">
              <ScanSearch size={18} />
              Scan a File Now
            </Link>
            <Link to="/dashboard" className="btn btn-outline">
              <BarChart3 size={18} />
              View Dashboard
            </Link>
          </div>

          {/* Threat ticker */}
          <div className="hero__ticker">
            <span className="hero__ticker-label">LIVE DETECTIONS</span>
            <div className="hero__ticker-items">
              {['Aadhaar detected in invoice.pdf', 'PAN blocked in email.eml', 'Credit card found in form.jpg', 'Passport number flagged in doc.docx'].map((item, i) => (
                <span key={i} className="hero__ticker-item">
                  <AlertTriangle size={12} style={{ color: 'var(--amber-400)' }} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-sm">
        <div className="container">
          <div className="grid-4">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="stat-card card">
                <Icon size={24} className="stat-card__icon" />
                <div className="stat-card__value">{value}</div>
                <div className="stat-card__label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="glow-divider container" />

      {/* Features */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-cyan">Features</span>
            <h2>Everything you need to protect sensitive data</h2>
            <p>30 purpose-built features covering every angle of enterprise data security.</p>
          </div>
          <div className="features-grid">
            {features.map(({ icon: Icon, title, desc, badge }) => (
              <div key={title} className="feature-card card">
                <div className="feature-card__top">
                  <div className="feature-card__icon-wrap">
                    <Icon size={22} />
                  </div>
                  <span className="badge badge-cyan feature-card__badge">{badge}</span>
                </div>
                <h3 className="feature-card__title">{title}</h3>
                <p className="feature-card__desc">{desc}</p>
              </div>
            ))}
          </div>
          <div className="features-more">
            <span>+ 21 more features including Email DLP, USB Control, Forensic Recording, Shadow AI Blocking...</span>
          </div>
        </div>
      </section>

      <div className="glow-divider container" />

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-cyan">How It Works</span>
            <h2>From upload to protection in seconds</h2>
          </div>
          <div className="how-grid">
            {howItWorks.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="how-card">
                <div className="how-card__step">{step}</div>
                <div className="how-card__icon">
                  <Icon size={28} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="glow-divider container" />

      {/* PII Types */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-red">Detection Engine</span>
            <h2>What sensitive data can we find?</h2>
            <p>Our AI recognizes 12+ types of personally identifiable information out of the box.</p>
          </div>
          <div className="pii-grid">
            {piiTypes.map((type) => (
              <div key={type} className="pii-chip">
                <CheckCircle size={14} style={{ color: 'var(--cyan-400)' }} />
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-banner__inner card">
            <div className="cta-banner__glow" />
            <Globe size={40} className="cta-banner__icon" />
            <h2>Ready to secure your organization's data?</h2>
            <p>Start scanning files and protecting sensitive information today.</p>
            <div className="cta-banner__btns">
              <Link to="/scan" className="btn btn-primary">
                <ScanSearch size={18} />
                Start Scanning
              </Link>
              <Link to="/dashboard" className="btn btn-ghost">
                View Dashboard <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
