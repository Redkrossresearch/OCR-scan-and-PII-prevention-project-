# OCR-Based DLP (Data Loss Prevention) System

An AI-powered Data Loss Prevention system that uses OCR, PII detection, and document security features to protect sensitive data.

## Project Structure

```
├── backend/              # FastAPI Python backend
│   ├── app/
│   │   ├── api/          # API route handlers
│   │   ├── core/         # Config, security, auth dependencies
│   │   ├── database/     # SQLAlchemy database setup
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── services/     # Business logic services
│   │   └── main.py       # FastAPI application entry
│   ├── .env              # Environment variables
│   └── requirements.txt  # Python dependencies
├── frontend/             # React + Vite + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/   # Shared UI components (Sidebar, Navbar)
│   │   ├── context/      # React context (Auth)
│   │   ├── pages/        # Page components
│   │   └── services/     # API client layer
│   └── package.json
└── README.md
```

## Features

### Core Features (from Durgesh's backend)
- **Authentication** - JWT-based user registration and login
- **File Upload** - Secure document upload with file type validation
- **OCR Text Extraction** - Tesseract-based text extraction from images and PDFs
- **PII Detection** - Detect emails, phone numbers, Aadhaar, PAN, passport, credit cards, SSN
- **PII Redaction & Blur** - Redact or blur sensitive information in documents
- **Risk Assessment** - Automatic risk scoring and classification
- **Clipboard Control** - Monitor clipboard for sensitive data
- **Email DLP** - Scan email content for data leaks
- **Shadow AI Detection** - Detect unauthorized AI tool usage
- **UEBA** - User and Entity Behavior Analytics
- **USB Control** - Device access management
- **Print Control** - Document print permissions
- **File Type Blocking** - Block restricted file types
- **Forensic Investigation** - Forensic logging and investigation tools

### Additional Features (from Mayur's code)
- **Document Watermark Detection**
- **Digital Signature Verification**
- **Tamper Detection** - SHA-256 based integrity checks
- **Document Classification** - Secret/Confidential/Internal/Public
- **Access Control Matrix** - Role-based access by risk level
- **Document Expiry Management**
- **Report Generation** - CSV and PDF export
- **Dashboard Analytics**

### Frontend Pages (from Lochana's scaffold + full build-out)
- **Dashboard** - Overview with stats and recent activity
- **Upload** - Drag-and-drop file upload
- **OCR** - Text extraction results
- **Detection** - Full PII detection with risk scores, security analysis
- **Risk** - Access control matrix and role-based checks
- **Audit** - Internal and forensic audit log viewer
- **Reports** - CSV and PDF report downloads

## Setup Instructions

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start the server (creates SQLite DB automatically)
uvicorn app.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Required Tools
- Python 3.10+
- Node.js 18+
- Tesseract OCR (for OCR features): https://github.com/tesseract-ocr/tesseract
  - Default path: `C:\Program Files\Tesseract-OCR\tesseract.exe`

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login and get JWT token |
| `/upload/` | POST | Upload a document |
| `/ocr/extract-text` | POST | Extract text via OCR |
| `/pii/detect` | POST | Detect PII in document |
| `/pii/redact` | POST | Redact PII from document |
| `/pii/blur` | POST | Blur PII in document |
| `/document/dashboard` | GET | Dashboard analytics |
| `/document/audit/logs` | GET | Internal audit logs |
| `/document/classify` | POST | Classify document |
| `/document/watermark/check` | POST | Check for watermarks |
| `/document/signature/verify` | POST | Verify digital signatures |
| `/document/tamper-check` | POST | Check document integrity |
| `/document/access/check` | POST | Role-based access check |
| `/forensic/logs` | GET | Forensic investigation logs |
| `/reports/csv` | GET | Download CSV report |
| `/reports/pdf` | GET | Download PDF report |

## Contributors
- **Durgesh** - Backend API, services, database models
- **Lochana** - Frontend scaffold, UI layout
- **Khushi** - Frontend design patterns
- **Mayur** - Additional backend features (classification, tamper, watermark, reports)
