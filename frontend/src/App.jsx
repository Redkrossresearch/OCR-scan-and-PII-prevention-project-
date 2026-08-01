import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DocumentAnalysisProvider } from "./context/DocumentAnalysisContext";

import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Upload from "./pages/Upload/Upload";
import OCR from "./pages/OCR/OCR";
import Detection from "./pages/Detection/Detection";
import Risk from "./pages/Risk/Risk";
import Audit from "./pages/Audit/Audit";
import Reports from "./pages/Reports/Reports";
import DLPControls from "./pages/DLPControls/DLPControls";
import AIBehavior from "./pages/AIBehavior/AIBehavior";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppLayout() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <div style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
          
            <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/ocr" element={<OCR />} />
            <Route path="/detection" element={<Detection />} />
            <Route path="/risk" element={<Risk />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/dlp-controls" element={<DLPControls />} />
            <Route path="/ai-behavior" element={<AIBehavior />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DocumentAnalysisProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </DocumentAnalysisProvider>
    </AuthProvider>
  );
}

export default App;
