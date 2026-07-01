Project Folder Structure

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
