import React, { useState } from 'react';
import { Settings as Gear, Shield, Bell, Database, Lock, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import './Settings.css';

const Toggle = ({ value, onChange }) => (
  <button className={`toggle ${value ? 'toggle--on' : ''}`} onClick={() => onChange(!value)}>
    {value ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
  </button>
);

export default function Settings() {
  const [settings, setSettings] = useState({
    aadhaarDetection: true,
    panDetection: true,
    emailDetection: true,
    phoneDetection: true,
    creditCardDetection: true,
    passportDetection: false,
    autoRedact: false,
    realTimeAlerts: true,
    emailNotify: true,
    slackNotify: false,
    auditLogs: true,
    batchReports: true,
    usbBlocking: true,
    shadowAIBlock: true,
    clipboardMonitor: false,
    printMonitor: true,
  });

  const set = (key) => (val) => setSettings(s => ({ ...s, [key]: val }));

  const Section = ({ icon: Icon, title, children }) => (
    <div className="settings-section card">
      <div className="settings-section__header">
        <Icon size={20} style={{ color: 'var(--cyan-400)' }} />
        <h3>{title}</h3>
      </div>
      <div className="settings-rows">{children}</div>
    </div>
  );

  const Row = ({ label, sub, value, onChange }) => (
    <div className="settings-row">
      <div>
        <div className="settings-row__label">{label}</div>
        {sub && <div className="settings-row__sub">{sub}</div>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-sub">Configure DLP policies, detection rules, and notifications</p>
          </div>
          <button className="btn btn-primary">
            <Save size={16} /> Save Changes
          </button>
        </div>

        <div className="settings-stack">
          <Section icon={Shield} title="PII Detection Rules">
            <Row label="Aadhaar Number Detection"  sub="Detect 12-digit Aadhaar numbers"            value={settings.aadhaarDetection}    onChange={set('aadhaarDetection')} />
            <Row label="PAN Card Detection"         sub="Detect ABCDE1234F format PAN numbers"       value={settings.panDetection}         onChange={set('panDetection')} />
            <Row label="Email Address Detection"    sub="Detect email addresses in all file types"   value={settings.emailDetection}       onChange={set('emailDetection')} />
            <Row label="Phone Number Detection"     sub="Detect Indian and international phone numbers" value={settings.phoneDetection}    onChange={set('phoneDetection')} />
            <Row label="Credit Card Detection"      sub="Detect Visa, Mastercard, Amex patterns"     value={settings.creditCardDetection}  onChange={set('creditCardDetection')} />
            <Row label="Passport Number Detection"  sub="Detect passport number formats"              value={settings.passportDetection}    onChange={set('passportDetection')} />
          </Section>

          <Section icon={Lock} title="DLP Actions">
            <Row label="Auto-Redact on Critical Risk" sub="Automatically redact PII in critical documents" value={settings.autoRedact} onChange={set('autoRedact')} />
            <Row label="Real-Time Policy Alerts"      sub="Alert admins immediately on policy violations"  value={settings.realTimeAlerts} onChange={set('realTimeAlerts')} />
            <Row label="USB / Removable Device Block" sub="Block sensitive files from being copied to USB" value={settings.usbBlocking} onChange={set('usbBlocking')} />
            <Row label="Shadow AI Blocking"           sub="Prevent data from being shared with AI tools"   value={settings.shadowAIBlock} onChange={set('shadowAIBlock')} />
            <Row label="Clipboard Monitoring"         sub="Monitor clipboard for sensitive data copying"   value={settings.clipboardMonitor} onChange={set('clipboardMonitor')} />
            <Row label="Print Monitoring & Control"   sub="Log or block printing of confidential docs"     value={settings.printMonitor} onChange={set('printMonitor')} />
          </Section>

          <Section icon={Bell} title="Notifications">
            <Row label="Email Notifications"  sub="Receive alerts via email"   value={settings.emailNotify}  onChange={set('emailNotify')} />
            <Row label="Slack Integration"    sub="Send alerts to Slack channel" value={settings.slackNotify}  onChange={set('slackNotify')} />
          </Section>

          <Section icon={Database} title="Data Retention">
            <Row label="Maintain Audit Logs"     sub="Keep complete activity logs for compliance" value={settings.auditLogs}     onChange={set('auditLogs')} />
            <Row label="Scheduled Batch Reports" sub="Auto-generate reports on a schedule"        value={settings.batchReports}  onChange={set('batchReports')} />
          </Section>
        </div>
      </div>
    </div>
  );
}
