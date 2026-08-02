const API_BASE = '';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
}

async function apiRequest(url, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (response.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  if (response.headers.get('content-type')?.includes('application/json')) {
    return response.json();
  }

  return response;
}

export const auth = {
  register: (data) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: async (data) => {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setToken(result.access_token);
    return result;
  },

  logout: () => {
    clearToken();
  },

  isAuthenticated: () => !!getToken(),

  forgotPassword: (email) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email, otp) =>
    apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  resetPassword: (email, otp, new_password) =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, new_password }),
    }),
};

export const upload = {
  file: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/upload/', { method: 'POST', body: formData });
  },
};

export const ocr = {
  extractText: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/ocr/extract-text', { method: 'POST', body: formData });
  },
};

export const pii = {
  detect: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/pii/detect', { method: 'POST', body: formData });
  },
  redact: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/pii/redact', { method: 'POST', body: formData });
  },
  blur: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/pii/blur', { method: 'POST', body: formData });
  },
};

export const documentFeatures = {
  watermarkCheck: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/document/watermark/check', { method: 'POST', body: formData });
  },
  signatureVerify: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/document/signature/verify', { method: 'POST', body: formData });
  },
  tamperCheck: (file, originalHash) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('original_hash', originalHash);
    return apiRequest('/document/tamper-check', { method: 'POST', body: formData });
  },
  classify: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/document/classify', { method: 'POST', body: formData });
  },
  accessCheck: (userRole, riskLevel) => {
    const formData = new URLSearchParams();
    formData.append('user_role', userRole);
    formData.append('risk_level', riskLevel);
    return apiRequest('/document/access/check', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },
  ownershipHistory: () => apiRequest('/document/ownership/history'),
  dashboard: () => apiRequest('/document/dashboard'),
  auditLogs: () => apiRequest('/document/audit/logs'),
  addAuditLog: (user, action, doc) => {
    const formData = new URLSearchParams();
    formData.append('user', user);
    formData.append('action', action);
    formData.append('document', doc);
    return apiRequest('/document/audit/log', { method: 'POST', body: formData, headers: {} });
  },
};

export const forensic = {
  logs: () => apiRequest('/forensic/logs'),
  record: (user, action, doc) => {
    const formData = new URLSearchParams();
    formData.append('user', user);
    formData.append('action', action);
    formData.append('document', doc);
    return apiRequest('/forensic/record', { method: 'POST', body: formData, headers: {} });
  },
};

export const reports = {
  downloadCSV: () => `${API_BASE}/reports/csv`,
  downloadPDF: () => `${API_BASE}/reports/pdf`,
  generatePDF: async (report) => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const response = await fetch(`${API_BASE}/reports/pdf`, {
      method: 'POST',
      headers,
      body: JSON.stringify(report),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'PDF generation failed' }));
      throw new Error(error.detail || 'PDF generation failed');
    }
    return response;
  },
  generateCSV: async (report) => {
    const token = getToken();
    const headers = { Authorization: `Bearer ${token}` };
    const response = await fetch(`${API_BASE}/reports/csv`, {
      method: 'POST',
      headers,
      body: JSON.stringify(report),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'CSV generation failed' }));
      throw new Error(error.detail || 'CSV generation failed');
    }
    return response;
  },
};

export const audit = {
  log: (user, action, details) => {
    const body = JSON.stringify({ user: user || 'unknown', action, details: details || '' });
    return fetch(`${API_BASE}/audit/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body,
    }).catch(() => null);
  },
  logs: () => apiRequest('/audit/logs'),
};

function formDataFrom(values) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.append(key, value));
  return formData;
}

export const policyAlerts = {
  create: (data) =>
    apiRequest('/policy-alerts/', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => apiRequest('/policy-alerts/'),
};

export const emailDLP = {
  scan: (data) =>
    apiRequest('/email-dlp/scan', { method: 'POST', body: JSON.stringify(data) }),
  status: () => apiRequest('/email-dlp/'),
};

export const clipboard = {
  check: (data) =>
    apiRequest('/clipboard/check', { method: 'POST', body: JSON.stringify(data) }),
};

export const printControl = {
  check: (userRole, documentType) =>
    apiRequest('/print-control/check', {
      method: 'POST',
      body: formDataFrom({ user_role: userRole, document_type: documentType }),
    }),
  logs: () => apiRequest('/print-control/logs'),
};

export const usbControl = {
  check: (userRole, deviceName) =>
    apiRequest('/usb-control/check', {
      method: 'POST',
      body: formDataFrom({ user_role: userRole, device_name: deviceName }),
    }),
  logs: () => apiRequest('/usb-control/logs'),
};

export const fileTypeBlocking = {
  check: (filename) =>
    apiRequest('/file-type/check', {
      method: 'POST',
      body: formDataFrom({ filename }),
    }),
  logs: () => apiRequest('/file-type/logs'),
};

export const shadowAI = {
  detect: (applicationName, user) =>
    apiRequest('/shadow-ai/detect', {
      method: 'POST',
      body: formDataFrom({ application_name: applicationName, user }),
    }),
  logs: () => apiRequest('/shadow-ai/logs'),
};

export const ueba = {
  analyze: (user, action, accessCount) =>
    apiRequest('/ueba/analyze', {
      method: 'POST',
      body: formDataFrom({ user, action, access_count: accessCount }),
    }),
  logs: () => apiRequest('/ueba/logs'),
};
