import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";

import Dashboard from "./pages/Dashboard/Dashboard";
import Upload from "./pages/Upload/Upload";
import OCR from "./pages/OCR/OCR";
import Detection from "./pages/Detection/Detection";
import Risk from "./pages/Risk/Risk";
import Audit from "./pages/Audit/Audit";
import Reports from "./pages/Reports/Reports";

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex" }}>
        <Sidebar />

        <div style={{ flex: 1 }}>
          <Navbar />

          <div style={{ padding: "20px" }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/ocr" element={<OCR />} />
              <Route path="/detection" element={<Detection />} />
              <Route path="/risk" element={<Risk />} />
              <Route path="/audit" element={<Audit />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;