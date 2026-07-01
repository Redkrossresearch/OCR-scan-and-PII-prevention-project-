import React, { useState, useRef } from 'react';
import {
  Upload, ScanSearch, AlertTriangle, CheckCircle, Eye,
  Shield, FileText, Clock, X, ChevronDown, ChevronUp,
  Lock, Scissors, Download
} from 'lucide-react';
import './FileScanner.css';

const mockResults = {
  filename: 'employee_data.pdf',
  fileSize: '2.4 MB',
  fileType: 'PDF',
  scanTime: '1.8s',
  riskScore: 'Critical',
  classification: 'Restricted',
  piiFound: [
    { type: 'Aadhaar Number', count: 3, value: '****-****-3721', severity: 'critical' },
    { type: 'PAN Card',       count: 2, value: 'ABCDE1234*',    severity: 'high' },
    { type: 'Email Address',  count: 7, value: 'john.d**@co.in', severity: 'medium' },
    { type: 'Phone Number',   count: 4, value: '+91 98765-****', severity: 'medium' },
  ],
  textExtracted: 'Employee ID: EMP001\nName: John Doe\nAadhaar: 1234-5678-3721\nPAN: ABCDE1234F\nEmail: john.doe@company.in\nMobile: +91 9876543210\n...',
};

const riskColors = { critical: 'badge-red', high: 'badge-amber', medium: 'badge-cyan', low: 'badge-green' };

export default function FileScanner() {
  const [stage, setStage] = useState('idle'); // idle | dragging | scanning | done
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [expandOcr, setExpandOcr] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (!file) return;
    startScan(file);
  };

  const startScan = (file) => {
    setSelectedFile(file);
    setStage('scanning');
    setProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setTimeout(() => {
          setResults({ ...mockResults, filename: file.name });
          setStage('done');
        }, 300);
      }
      setProgress(Math.min(p, 100));
    }, 200);
  };

  const reset = () => { setStage('idle'); setResults(null); setProgress(0); setSelectedFile(null); };

  const scanSteps = [
    'Validating file format…',
    'Extracting text via OCR…',
    'Running PII detection engine…',
    'Calculating risk score…',
    'Generating report…',
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">File Scanner</h1>
            <p className="page-sub">Upload any file to scan for sensitive data and PII</p>
          </div>
          {stage === 'done' && (
            <button className="btn btn-outline" onClick={reset}>
              <ScanSearch size={16} /> Scan Another File
            </button>
          )}
        </div>

        {/* Upload zone */}
        {stage === 'idle' && (
          <div
            className="upload-zone card"
            onDragOver={(e) => { e.preventDefault(); setStage('dragging'); }}
            onDragLeave={() => setStage('idle')}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
          >
            <div className="upload-zone__icon">
              <Upload size={40} />
            </div>
            <h2 className="upload-zone__title">Drop your file here to scan</h2>
            <p className="upload-zone__sub">Supports PDF, DOCX, TXT, JPG, PNG, TIFF and more</p>
            <button className="btn btn-primary upload-zone__btn" onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}>
              <Upload size={16} /> Choose File
            </button>
            <div className="upload-zone__types">
              {['PDF','DOCX','TXT','JPG','PNG','TIFF','XLS','CSV'].map(t => (
                <span key={t} className="upload-zone__type">{t}</span>
              ))}
            </div>
            <input ref={fileRef} type="file" style={{ display:'none' }} onChange={handleDrop} />
          </div>
        )}

        {/* Dragging */}
        {stage === 'dragging' && (
          <div className="upload-zone upload-zone--dragging card"
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setStage('idle')}
            onDrop={handleDrop}
          >
            <div className="upload-zone__icon upload-zone__icon--active"><Upload size={48} /></div>
            <h2>Release to scan</h2>
          </div>
        )}

        {/* Scanning */}
        {stage === 'scanning' && (
          <div className="scan-progress card">
            <div className="scan-progress__header">
              <ScanSearch size={28} className="scan-progress__icon" />
              <h2>Scanning <span>{selectedFile?.name}</span></h2>
            </div>
            <div className="scan-bar-wrap">
              <div className="scan-bar">
                <div className="scan-bar__fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="scan-bar__pct">{Math.round(progress)}%</span>
            </div>
            <div className="scan-steps">
              {scanSteps.map((step, i) => (
                <div key={i} className={`scan-step ${progress > i * 20 ? 'scan-step--done' : ''}`}>
                  <CheckCircle size={14} />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {stage === 'done' && results && (
          <div className="results">
            {/* Summary bar */}
            <div className={`result-summary card result-summary--${results.riskScore.toLowerCase()}`}>
              <div className="result-summary__left">
                <div className="result-summary__icon">
                  <AlertTriangle size={28} />
                </div>
                <div>
                  <div className="result-summary__title">Scan Complete — Sensitive Data Detected</div>
                  <div className="result-summary__file">{results.filename} · {results.fileSize} · {results.scanTime}</div>
                </div>
              </div>
              <div className="result-summary__right">
                <div>
                  <div className="result-meta-label">Risk Score</div>
                  <span className="badge badge-red" style={{ fontSize: 13 }}>{results.riskScore}</span>
                </div>
                <div>
                  <div className="result-meta-label">Classification</div>
                  <span className="badge badge-red" style={{ fontSize: 13 }}>{results.classification}</span>
                </div>
              </div>
            </div>

            {/* PII table */}
            <div className="card mb-24">
              <div className="chart-card__header">
                <div>
                  <h3>Detected PII</h3>
                  <p>{results.piiFound.length} types of sensitive data found</p>
                </div>
                <Eye size={18} style={{ color: 'var(--cyan-400)' }} />
              </div>
              <table className="pii-table">
                <thead>
                  <tr>
                    <th>PII Type</th>
                    <th>Sample (Masked)</th>
                    <th>Count</th>
                    <th>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {results.piiFound.map((p, i) => (
                    <tr key={i}>
                      <td>{p.type}</td>
                      <td><code>{p.value}</code></td>
                      <td>{p.count}</td>
                      <td>
                        <span className={`badge ${riskColors[p.severity]}`}>{p.severity}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* OCR text */}
            <div className="card mb-24">
              <button className="ocr-toggle" onClick={() => setExpandOcr(!expandOcr)}>
                <div>
                  <h3>Extracted Text (OCR Output)</h3>
                  <p>Raw text extracted from the document</p>
                </div>
                {expandOcr ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {expandOcr && (
                <pre className="ocr-text">{results.textExtracted}</pre>
              )}
            </div>

            {/* Actions */}
            <div className="result-actions">
              <button className="btn btn-primary">
                <Scissors size={16} /> Redact All PII
              </button>
              <button className="btn btn-outline">
                <Lock size={16} /> Quarantine File
              </button>
              <button className="btn btn-ghost">
                <Download size={16} /> Export Report
              </button>
              <button className="btn btn-ghost" style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} onClick={reset}>
                <X size={16} /> Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
