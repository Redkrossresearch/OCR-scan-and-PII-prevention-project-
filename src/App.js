import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import FileScanner from './pages/FileScanner';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"              element={<Home />} />
        <Route path="/dashboard"     element={<Dashboard />} />
        <Route path="/scan"          element={<FileScanner />} />
        <Route path="/reports"       element={<Reports />} />
        <Route path="/users"         element={<UserManagement />} />
        <Route path="/audit"         element={<AuditLogs />} />
        <Route path="/settings"      element={<Settings />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
