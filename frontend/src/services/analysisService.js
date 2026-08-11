import {
  upload,
  ocr,
  pii,
  documentFeatures,
  policyAlerts,
  emailDLP,
  clipboard,
  printControl,
  encryption,
  usbControl,
  shadowAI,
  ueba,
  audit,
} from './api';

const PII_KEYS = [
  'emails',
  'phone_numbers',
  'aadhaar_numbers',
  'pan_numbers',
  'credit_cards',
  'ssn_numbers',
  'passport_numbers',
  'ifsc_codes',
  'gstin_numbers',
  'bank_account_numbers',
];

const AI_TOOLS = ['chatgpt', 'openai', 'copilot', 'bard', 'gemini', 'claude'];

function getExtension(name) {
  const parts = String(name || '').split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

function normalizeRisk(level) {
  const l = String(level || '').toLowerCase();
  if (l.includes('critical')) return 'Critical';
  if (l.includes('high')) return 'High';
  if (l.includes('medium')) return 'Medium';
  return 'Low';
}

function severityFor(risk) {
  return risk;
}

function documentTypeFor(risk) {
  if (risk === 'Critical') return 'restricted';
  if (risk === 'High') return 'confidential';
  if (risk === 'Medium') return 'internal';
  return 'public';
}

function findAITool(text) {
  const lower = String(text || '').toLowerCase();
  return AI_TOOLS.find((tool) => lower.includes(tool)) || null;
}

function uebaAccessCountFor(riskScore) {
  if (riskScore > 70) return 60;
  if (riskScore > 40) return 30;
  return 10;
}

function piiSummary(pii) {
  if (!pii) return 'no PII data available';
  const parts = PII_KEYS.filter((key) => Array.isArray(pii[key]) && pii[key].length > 0).map(
    (key) => `${pii[key].length} ${key.replace(/_/g, ' ')}`
  );
  if (Array.isArray(pii.keyword_categories) && pii.keyword_categories.length > 0) {
    parts.push(`sensitive content categories: ${pii.keyword_categories.join(', ')}`);
  }
  return parts.length ? parts.join(', ') : 'No sensitive data detected';
}

const AUDIT_ACTIONS = {
  'Uploading document': 'DOCUMENT_UPLOADED',
  'Running OCR extraction': 'OCR_EXTRACTED',
  'Detecting PII': 'PII_DETECTED',
  'Analyzing risk & access': 'RISK_ANALYZED',
  'Creating policy alert': 'POLICY_ALERT_CREATED',
  'Scanning email DLP': 'EMAIL_DLP_SCANNED',
  'Checking clipboard control': 'CLIPBOARD_CHECKED',
  'Checking print policy': 'PRINT_POLICY_CHECKED',
  'Checking USB policy': 'USB_POLICY_CHECKED',
  'Detecting shadow AI usage': 'SHADOW_AI_DETECTED',
  'Analyzing user behavior': 'UEBA_ANALYZED',
};

async function runModule(user, label, onProgress, fn) {
  if (onProgress) onProgress(label);
  let result;
  try {
    result = { ok: true, data: await fn() };
  } catch (err) {
    result = { ok: false, data: null, error: err.message || 'Module failed' };
  }
  audit.log(user, AUDIT_ACTIONS[label] || 'MODULE_RUN', `${label} → ${result.ok ? 'success' : 'failed'}`);
  return result;
}

function buildCompliance(pii) {
  const items = [];
  const has = (key) => Array.isArray(pii?.[key]) && pii[key].length > 0;

  if (has('credit_cards')) items.push({ name: 'PCI-DSS', status: 'fail', detail: 'Payment card data detected' });
  if (has('aadhaar_numbers') || has('pan_numbers')) {
    items.push({ name: 'DPDP Act (India)', status: 'fail', detail: 'National identity data detected' });
  }
  if (has('ssn_numbers')) items.push({ name: 'GLBA', status: 'fail', detail: 'Social security numbers detected' });
  if (has('passport_numbers')) items.push({ name: 'GDPR', status: 'fail', detail: 'Identity document numbers detected' });
  if (has('bank_account_numbers') || has('ifsc_codes')) {
    items.push({ name: 'RBI Data Guidelines', status: 'fail', detail: 'Bank account / IFSC data detected' });
  }
  if (has('gstin_numbers')) {
    items.push({ name: 'GST Act (India)', status: 'review', detail: 'GSTIN detected — verify handling policy' });
  }
  if (has('emails') || has('phone_numbers')) {
    items.push({ name: 'GDPR', status: 'review', detail: 'Contact data detected — data minimisation recommended' });
  }
  if (has('keywords')) {
    items.push({ name: 'Data Classification', status: 'review', detail: 'Sensitive keywords detected in content' });
  }
  if (items.length === 0) {
    items.push({ name: 'Compliance', status: 'pass', detail: 'No regulated data detected in document' });
  }

  const failed = items.filter((item) => item.status === 'fail').length;
  const summary = failed
    ? `${failed} compliance control(s) failed`
    : 'Document appears compliant';
  return { summary, items };
}

function buildRecommendations({
  riskLevel,
  pii,
  emailDlp,
  clipboard,
  printControl,
  usbControl,
  shadowAi,
  ueba,
}) {
  const recs = [];
  const hasPii = PII_KEYS.some((key) => Array.isArray(pii?.[key]) && pii[key].length > 0);

  if (riskLevel === 'Critical') {
    recs.push('Immediate action required: quarantine the document and restrict access to administrators only.');
  } else if (riskLevel === 'High') {
    recs.push('Restrict access to managers and administrators and monitor all future access attempts.');
  } else if (riskLevel === 'Medium') {
    recs.push('Apply additional review before sharing this document externally.');
  }

  if (hasPii) recs.push('Redact or encrypt all sensitive data before sharing or storing the document.');

  if (emailDlp?.ok && emailDlp.data?.sensitive_data_found) {
    recs.push('Email transmission blocked — remove sensitive content from the message before resending.');
  }
  if (clipboard?.ok && clipboard.data?.blocked) {
    recs.push('Clipboard copying blocked to prevent data exfiltration via copy-paste.');
  }
  if (printControl?.ok && printControl.data?.allowed === false) {
    recs.push('Printing blocked for this document. Authorized users must request an exception.');
  }
  if (usbControl?.ok && usbControl.data?.usb_allowed === false) {
    recs.push('USB transfer blocked for this document and user.');
  }
  if (shadowAi?.ok && shadowAi.data?.shadow_ai_detected) {
    recs.push('Unauthorized AI tool usage detected — investigate and enforce the approved AI tools policy.');
  }
  if (ueba?.ok && ueba.data?.risk_level === 'High') {
    recs.push('User behavior flagged as high risk — review account activity and enforce additional verification.');
  }

  if (recs.length === 0) recs.push('Document passed all checks. No action required.');
  return recs;
}

function buildReport(inputs) {
  const {
    file,
    extension,
    user,
    scannedAt,
    uploadResult,
    ocrResult,
    piiResult,
    accessResult,
    policyAlertResult,
    emailDlpResult,
    clipboardResult,
    printResult,
    usbResult,
    shadowAiResult,
    uebaResult,
    encryptionResult,
  } = inputs;

  const piiData = piiResult.ok ? piiResult.data : {};
  const riskLevel = normalizeRisk(piiData.risk_level);
  const riskScore = Math.min(100, Number(piiData.risk_score) || 0);
  const classification =
    (typeof piiData.classification === 'string' ? piiData.classification : piiData.classification?.classification) ||
    (piiResult.ok ? 'Unclassified' : 'Error');


  const compliance = buildCompliance(piiData);

  const recommendations = buildRecommendations({
    riskLevel,
    pii: piiData,
    emailDlp: emailDlpResult,
    clipboard: clipboardResult,
    printControl: printResult,
    usbControl: usbResult,
    shadowAi: shadowAiResult,
    ueba: uebaResult,
  });

  return {
    document: {
      filename: file.name,
      size: file.size,
      extension,
      user,
      scanned_at: scannedAt,
      upload: uploadResult.ok ? uploadResult.data : { message: uploadResult.error || 'Upload failed' },
    },
    ocr: ocrResult,
    pii: piiResult,
    risk: {
      ok: piiResult.ok,
      risk_level: riskLevel,
      risk_score: riskScore,
      classification,
      access: accessResult,
    },
    policyAlert: policyAlertResult,
    emailDlp: emailDlpResult,
    clipboard: clipboardResult,
    printControl: printResult,
    usbControl: usbResult,
    encryption: encryptionResult,
    shadowAi: shadowAiResult,
    ueba: uebaResult,
    compliance,
    recommendations,
  };
}

export async function analyzeDocument(file, user, onProgress, userRole = 'employee') {
  if (!file) throw new Error('No file provided for analysis');

  const scannedAt = new Date().toISOString();
  const extension = getExtension(file.name);

  // 1. Upload
  const uploadResult = await runModule(user, 'Uploading document', onProgress, () => upload.file(file));

  // 2. OCR
  const ocrResult = await runModule(user, 'Running OCR extraction', onProgress, () => ocr.extractText(file));
  const ocrText = ocrResult.ok ? ocrResult.data?.extracted_text || '' : '';

  // 3. PII Detection
  const piiResult = await runModule(user, 'Detecting PII', onProgress, () => pii.detect(file));

  // 4. Risk / Access Analysis
  const piiData = piiResult.ok ? piiResult.data : {};
  const riskLevel = normalizeRisk(piiData.risk_level);
  const accessResult = await runModule(user, 'Analyzing risk & access', onProgress, () =>
    documentFeatures.accessCheck(userRole, riskLevel.toLowerCase())
  );

  // 5. Policy Alerts — only raise an alert when the scan actually found something risky
  const hasPiiRisk = PII_KEYS.some((key) => Array.isArray(piiData?.[key]) && piiData[key].length > 0);
  const shouldRaiseAlert = riskLevel !== 'Low' || hasPiiRisk;

  const policyAlertResult = shouldRaiseAlert
    ? await runModule(user, 'Creating policy alert', onProgress, () =>
        policyAlerts.create({
          user,
          policy_name: `Sensitive Data Access — ${classificationFor(piiData, piiResult)}`,
          severity: severityFor(riskLevel),
          description: `Document "${file.name}" analyzed. ${piiSummary(piiData)}. Risk level: ${riskLevel}.`,
        })
      )
    : { ok: false, data: null, skipped: true, error: 'No sensitive data detected — no policy alert needed.' };

  // 6. Email DLP
  const emailDlpResult = await runModule(user, 'Scanning email DLP', onProgress, () =>
    emailDLP.scan({
      sender: user,
      receiver: 'security@company.com',
      subject: file.name,
      content: ocrText,
    })
  );

  // 7. Clipboard Control
  const clipboardResult = await runModule(user, 'Checking clipboard control', onProgress, () =>
    clipboard.check({ user, content: ocrText })
  );

  // 8. Print Control
  const documentType = documentTypeFor(riskLevel);
  const printResult = await runModule(user, 'Checking print policy', onProgress, () =>
    printControl.check(userRole, documentType)
  );

  // 9. USB Control
  const deviceName = `USB Drive (${extension || 'unknown'})`;
  const usbResult = await runModule(user, 'Checking USB policy', onProgress, () =>
    usbControl.check(userRole, deviceName)
  );

  // 10. Shadow AI
  const aiTool = findAITool(ocrText) || 'No AI Tool Detected';
  const shadowAiResult = await runModule(user, 'Detecting shadow AI usage', onProgress, () =>
    shadowAI.detect(aiTool, user)
  );

  // 12. UEBA
  const accessCount = uebaAccessCountFor(Math.min(100, Number(piiData.risk_score) || 0));
  const uebaResult = await runModule(user, 'Analyzing user behavior', onProgress, () =>
    ueba.analyze(user, 'document_access', accessCount)
  );

  // 12.5 Auto-Encryption for High/Critical risk documents
  const encryptionResult = await runModule(user, 'Applying document protection', onProgress, () =>
    encryption.protect(file, riskLevel, userRole, user)
  );

  // 13. Unified Security Report
  const report = buildReport({
    file,
    extension,
    user,
    scannedAt,
    uploadResult,
    ocrResult,
    piiResult,
    accessResult,
    policyAlertResult,
    emailDlpResult,
    clipboardResult,
    printResult,
    usbResult,
    shadowAiResult,
    uebaResult,
    encryptionResult,
  });

  if (onProgress) onProgress('Analysis complete');
  audit.log(user, 'DOCUMENT_ANALYZED', `Analyzed "${file.name}" — risk ${riskLevel} (${report.risk.risk_score})`);
  return report;
}

function classificationFor(piiData, piiResult) {
  if (typeof piiData?.classification === 'string' && piiData.classification) {
    return piiData.classification;
  }
  if (piiData?.classification?.classification) return piiData.classification.classification;
  return piiResult.ok ? 'Unclassified' : 'Error';
}