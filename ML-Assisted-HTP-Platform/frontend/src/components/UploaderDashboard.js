import React, { useState, useEffect, useCallback, useRef } from 'react';
import './UploaderDashboard.css';
import logoUrl from '../assets/choice-foundation-logo.png';
import * as api from '../api';

// Import hooks and child components
import { useAuth } from '../context/AuthContext';
import UploaderHome from './uploader/UploaderHome';
import UploadForm from './uploader/UploadForm';
import SubmissionStatus from './uploader/SubmissionStatus';

/**
 * A self-contained, styled alert component for providing user feedback.
 */
const CustomAlert = ({ message, type, onClose }) => (
  <div className={`custom-alert alert-${type}`}>
    <p>{message}</p>
    <button onClick={onClose} className="alert-close-btn">&times;</button>
  </div>
);

/**
 * The main parent component for the Uploader portal. It manages state,
 * data fetching, and navigation between the Home, Upload, and Status views.
 */
function UploaderDashboard() {
  const [view, setView] = useState('home'); // 'home', 'upload', 'status'
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: '', type: '', visible: false });
  
  // Refs are used to manage timers across re-renders without causing side effects.
  const pollingIntervalRef = useRef(null);
  const alertTimeoutRef = useRef(null);
  
  const { logout, user } = useAuth();

  // --- Alert Management ---
  const showAlert = useCallback((message, type = 'success') => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setAlert({ message, type, visible: true });
    alertTimeoutRef.current = setTimeout(() => {
        setAlert(prev => ({ ...prev, visible: false }));
    }, 5000);
  }, []);

  const closeAlert = useCallback(() => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setAlert(prev => ({ ...prev, visible: false }));
  }, []);

  // --- Data Fetching ---
  const fetchHistory = useCallback(async (isPolling = false) => {
    // Only show the main full-page loader on initial load, not background updates.
    if (!isPolling) {
        setLoading(true);
    }
    try {
      const { data } = await api.getMyDrawingsWithCases();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch submission history.", error);
      if (!isPolling) showAlert("Could not load submission history.", "error");
    } finally {
        if (!isPolling) {
            setLoading(false);
        }
    }
  }, [showAlert]);

  // --- Live Update (Polling) Logic ---
  useEffect(() => {
    const stopPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };

    // This effect runs whenever the `view` state changes.
    if (view === 'status') {
      // Fetch data immediately when the user navigates to the status page.
      fetchHistory();
      
      // Then, start an interval to poll for new data every 15 seconds.
      pollingIntervalRef.current = setInterval(() => {
        console.log('Polling for status updates...');
        fetchHistory(true); // `true` signifies a silent background poll.
      }, 15000); // 15 seconds
    } else {
      // If the view is NOT 'status', make sure any active polling is stopped.
      stopPolling();
    }

    // This cleanup function is crucial. It runs when the component unmounts
    // or before the effect runs again, ensuring we don't have multiple intervals running.
    return () => {
      stopPolling();
    };
  }, [view, fetchHistory]);

  // --- Event Handlers ---
  const handleUploadSuccess = () => {
      fetchHistory().then(() => {
          setView('status'); // After successful upload, show the status page.
      });
  };

  // --- Content Rendering ---
  const renderContent = () => {
    switch (view) {
      case 'upload':
        return <UploadForm setView={setView} onUploadSuccess={handleUploadSuccess} showAlert={showAlert} />;
      case 'status':
        return <SubmissionStatus setView={setView} history={history} loading={loading} />;
      case 'home':
      default:
        return <UploaderHome setView={setView} user={user} />;
    }
  };

  return (
    <div className="uploader-container">
      {alert.visible && <CustomAlert message={alert.message} type={alert.type} onClose={closeAlert} />}

      <header className="uploader-header">
        <div className="header-left">
          <img src={logoUrl} alt="Choice Foundation" className="uploader-logo" />
          <div className="header-title">
            <h2>HTP Analysis Platform</h2>
            <span className="header-subtitle">Uploader Portal</span>
          </div>
        </div>
        <div className="header-right">
          {view !== 'home' && (
            <button onClick={() => setView('home')} className="btn-home">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Home
            </button>
          )}
          <button onClick={logout} className="logout-button">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </header>
      <main className="uploader-main">
        {renderContent()}
      </main>
    </div>
  );
}

export default UploaderDashboard;