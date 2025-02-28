import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import History from './pages/History';
import Education from './pages/Education';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Layout
import Layout from './components/layout/Layout';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { AnalysisProvider } from './context/AnalysisContext';
import { HistoryProvider } from './context/HistoryContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AnalysisProvider>
        <HistoryProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/analyze" element={<Analyze />} />
                <Route path="/history" element={<History />} />
                <Route path="/education" element={<Education />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </Router>
        </HistoryProvider>
      </AnalysisProvider>
    </AuthProvider>
  );
};

export default App;