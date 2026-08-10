import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { analyzeDocument } from '../services/analysisService';
import { useAuth } from './AuthContext';

const DocumentAnalysisContext = createContext(null);

export function DocumentAnalysisProvider({ children }) {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState('');

  const runAnalysis = useCallback(
    async (uploadedFile, userRole = 'employee') => {
      setFile(uploadedFile);
      setAnalyzing(true);
      setError('');
      setProgress(0);
      setCurrentStep('Starting analysis...');
      const username = user?.email || 'current-user';
      try {
        const result = await analyzeDocument(uploadedFile, username, (label) => {
          setCurrentStep(label);
          setProgress((prev) => Math.min(95, prev + 8));
        }, userRole);
        setReport(result);
        setProgress(100);
        setCurrentStep('Analysis complete');
        return result;
      } catch (err) {
        setError(err.message || 'Document analysis failed');
        setReport(null);
        throw err;
      } finally {
        setAnalyzing(false);
      }
    },
    [user]
  );

  const clearAnalysis = useCallback(() => {
    setFile(null);
    setReport(null);
    setError('');
    setProgress(0);
    setCurrentStep('');
  }, []);

  const value = useMemo(
    () => ({
      file,
      report,
      analyzing,
      progress,
      currentStep,
      error,
      runAnalysis,
      clearAnalysis,
    }),
    [file, report, analyzing, progress, currentStep, error, runAnalysis, clearAnalysis]
  );

  return (
    <DocumentAnalysisContext.Provider value={value}>{children}</DocumentAnalysisContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDocumentAnalysis() {
  return useContext(DocumentAnalysisContext);
}