import { lazy, Suspense, useEffect, useState } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import { useToast, ToastContainer } from './hooks/useToast';
import { useTheme } from './context/ThemeContext';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const LiveTest = lazy(() => import('./pages/LiveTest'));
const Benchmark = lazy(() => import('./pages/Benchmark'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Compare = lazy(() => import('./pages/Compare'));
const History = lazy(() => import('./pages/History'));
const Settings = lazy(() => import('./pages/Settings'));

const STORAGE_KEYS = {
  results: 'aiperf_results',
  apiKeys: 'aiperf_api_keys',
  page: 'aiperf_page',
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activePage, setActivePage] = useState(() => loadFromStorage(STORAGE_KEYS.page, 'dashboard'));
  const [results, setResults] = useState(() => loadFromStorage(STORAGE_KEYS.results, []));
  const [apiKeys, setApiKeys] = useState(() => loadFromStorage(STORAGE_KEYS.apiKeys, {}));
  const { toasts, showToast } = useToast();
  const { theme, toggle } = useTheme();

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.results, JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.apiKeys, JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.page, activePage);
  }, [activePage]);

  const handleResult = (result) => {
    setResults(prev => [...prev, result]);
  };

  const handleClearHistory = () => {
    setResults([]);
    showToast('History cleared', 'success');
  };

  const handleSaveKey = (providerId, key) => {
    setApiKeys(prev => ({ ...prev, [providerId]: key }));
  };

  const navigate = (page) => {
    setActivePage(page);
  };

  const pages = {
    dashboard: <Dashboard results={results} showToast={showToast} />,
    live: <LiveTest apiKeys={apiKeys} onResult={handleResult} showToast={showToast} />,
    benchmark: <Benchmark onResult={handleResult} showToast={showToast} />,
    leaderboard: <Leaderboard results={results} />,
    compare: <Compare results={results} showToast={showToast} />,
    history: <History results={results} onClear={handleClearHistory} />,
    settings: <Settings apiKeys={apiKeys} onSaveKey={handleSaveKey} showToast={showToast} />,
  };

  return (
    <>
      {/* Animated background */}
      <div className="bg-grid" />
      <div className="app-shell" style={{ position: 'relative', zIndex: 1 }}>
        {/* Topbar */}
        <header className="topbar">
          <a href="#" className="topbar-logo" onClick={e => { e.preventDefault(); navigate('dashboard'); }}>
            <div className="topbar-logo-icon" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/favicon.svg" width="22" height="22" alt="AI Performance Logo" />
            </div>
            <span className="topbar-logo-text">AiMon</span>
          </a>

          <div className="topbar-actions">
            <button 
              onClick={toggle}
              className="btn btn-secondary btn-sm" 
              style={{ width: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
              <div className="status-dot" />
              <span>{results.length} runs</span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('benchmark')}
            >
              ⚡ Benchmark
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('live')}
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 0 20px rgba(239,68,68,0.3)' }}
            >
              🔴 Live Test
            </button>
          </div>
        </header>

        {/* Sidebar */}
        <Sidebar activePage={activePage} onNavigate={navigate} />

        {/* Main */}
        <main className="main-content">
          <Suspense fallback={<PageLoader />}>
            {pages[activePage] || pages.dashboard}
          </Suspense>
        </main>
      </div>

      <ToastContainer toasts={toasts} />
    </>
  );
}

function PageLoader() {
  return (
    <div className="card page-loader" role="status" aria-live="polite">
      <span className="spinner" />
      <span>Loading page…</span>
    </div>
  );
}
