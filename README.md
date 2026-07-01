# ShieldScan DLP – React Frontend

## Complete Setup Guide (For Beginners)

---

## STEP 1: Install Node.js (Required first)

1. Go to: https://nodejs.org
2. Click the **LTS (Recommended)** version button — download and install it
3. After install, open VS Code terminal (Terminal > New Terminal) and type:
   ```
   node --version
   ```
   You should see something like `v20.x.x` — this means Node is installed ✅

---

## STEP 2: Open the Project in VS Code

1. Open **VS Code**
2. Go to **File > Open Folder**
3. Select the `dlp-frontend` folder
4. VS Code will open the project

---

## STEP 3: Install Project Dependencies

In the VS Code terminal, type this command and press Enter:

```bash
npm install
```

This will download all required packages (React, Recharts, etc.)
⏳ Wait 1–2 minutes for it to finish. You'll see a `node_modules` folder appear.

---

## STEP 4: Start the Development Server

```bash
npm start
```

This will:
- Start a local server
- Automatically open your browser at: **http://localhost:3000**
- Show your DLP website! 🎉

The page **auto-refreshes** whenever you save a file — no need to restart.

---

## STEP 5: Project Folder Structure

```
dlp-frontend/
├── public/
│   └── index.html          ← Main HTML template
├── src/
│   ├── index.js            ← Entry point (don't change)
│   ├── index.css           ← Global styles & design tokens
│   ├── App.js              ← Routes (connects all pages)
│   ├── components/
│   │   ├── Navbar.js       ← Top navigation bar
│   │   ├── Navbar.css
│   │   ├── Footer.js       ← Bottom footer
│   │   └── Footer.css
│   └── pages/
│       ├── Home.js         ← Landing page
│       ├── Home.css
│       ├── Dashboard.js    ← Charts & stats dashboard
│       ├── Dashboard.css
│       ├── FileScanner.js  ← File upload & scan results
│       ├── FileScanner.css
│       ├── Reports.js      ← Reports & downloads
│       ├── Reports.css
│       ├── UserManagement.js ← User roles & access
│       ├── UserManagement.css
│       ├── AuditLogs.js    ← Activity logs
│       ├── AuditLogs.css
│       ├── Settings.js     ← DLP policy toggles
│       └── Settings.css
└── package.json            ← Project config & dependencies
```

---

## STEP 6: Connecting to Your Python Backend

When your team's Python backend is ready, you'll connect it here.

### In FileScanner.js, find this section and replace with real API call:

```javascript
// CURRENTLY (mock data):
const startScan = (file) => {
  // fake scanning animation
};

// REPLACE WITH (real backend):
const startScan = async (file) => {
  setStage('scanning');
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:8000/api/scan', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    setResults(data);
    setStage('done');
  } catch (error) {
    console.error('Scan failed:', error);
  }
};
```

### Expected Backend API Endpoints:

| Endpoint               | Method | Purpose                    |
|------------------------|--------|----------------------------|
| `/api/scan`            | POST   | Upload & scan a file       |
| `/api/dashboard/stats` | GET    | Get dashboard statistics   |
| `/api/reports`         | GET    | List all reports           |
| `/api/reports/export`  | GET    | Download a report          |
| `/api/users`           | GET    | List users                 |
| `/api/audit-logs`      | GET    | Get audit trail            |

### Allow CORS in your Python Flask/FastAPI backend:

**Flask:**
```python
from flask_cors import CORS
CORS(app)
```

**FastAPI:**
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_methods=["*"], allow_headers=["*"])
```

---

## STEP 7: Build for Production (When Ready to Deploy)

```bash
npm run build
```

This creates a `build/` folder with optimized files ready for hosting.

---

## Pages Available

| URL           | Page             | Description                              |
|---------------|------------------|------------------------------------------|
| `/`           | Home             | Landing page with features & overview    |
| `/dashboard`  | Dashboard        | Live charts, stats, and recent scans     |
| `/scan`       | File Scanner     | Upload files for OCR + PII scanning      |
| `/reports`    | Reports          | Generate and download compliance reports |
| `/users`      | User Management  | Manage roles, permissions, users         |
| `/audit`      | Audit Logs       | Full activity trail                      |
| `/settings`   | Settings         | Toggle DLP policies and notifications    |

---

## Common Issues & Fixes

| Problem                         | Fix                                                   |
|---------------------------------|-------------------------------------------------------|
| `npm: not found`                | Install Node.js from nodejs.org first                 |
| Port 3000 already in use        | Type `Y` when asked to use another port               |
| `Module not found` error        | Run `npm install` again                               |
| White screen in browser         | Open browser console (F12) and check for errors      |
| Changes not showing             | Save the file — browser auto-refreshes                |

---

## Tech Stack Used

- **React 18** – UI framework
- **React Router v6** – Page navigation
- **Recharts** – Charts and graphs
- **Lucide React** – Icons
- **CSS Custom Properties** – Design system / theming
- **CSS Grid & Flexbox** – Responsive layout

---

## Designer Notes

Colors used (for reference when customizing):
- Navy Background: `#0a0f1e`
- Cyan Accent: `#06b6d4` / `#22d3ee`
- Danger/Red: `#ef4444`
- Warning/Amber: `#f59e0b`
- Success/Green: `#22c55e`

All color tokens are in `src/index.css` under `:root { ... }`.

---

*Built for ShieldScan DLP – AI-Powered Data Loss Prevention*
