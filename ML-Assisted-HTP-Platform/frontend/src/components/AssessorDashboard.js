import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as api from '../api';
import './AssessorDashboard.css';
import ReviewView from './ReviewView';

import { useAuth } from '../context/AuthContext';
import logoUrl from '../assets/choice-foundation-logo.png';

const CustomAlert = ({ message, type, onClose }) => (
  <div className={`custom-alert alert-${type}`}>
    <p>{message}</p>
    <button onClick={onClose} className="alert-close-btn">&times;</button>
  </div>
);

const DashboardView = ({ cases, onSelectCase, user, loadingCaseId }) => {
    const [activeTab, setActiveTab] = useState('flagged');
    const [completedFilter, setCompletedFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Memoized calculation for case counts on each tab for efficiency
    const caseCounts = useMemo(() => {
        return {
            flagged: cases.filter(c => c.status === 'Flagged for Review').length,
            pending: cases.filter(c => c.status === 'Initial Screening' || c.status === 'Flagged for Review').length,
            completed: cases.filter(c => c.status.toLowerCase().startsWith('completed')).length,
        };
    }, [cases]);

    const filteredCases = useMemo(() => {
        let tabFilteredCases = [];
        const lowerCaseFilter = completedFilter.toLowerCase();
        switch (activeTab) {
            case 'flagged':
                tabFilteredCases = cases.filter(c => c.status === 'Flagged for Review');
                break;
            case 'pending':
                tabFilteredCases = cases.filter(c => c.status === 'Initial Screening' || c.status === 'Flagged for Review');
                break;
            case 'completed':
                if (lowerCaseFilter === 'all') {
                    tabFilteredCases = cases.filter(c => c.status.toLowerCase().startsWith('completed'));
                } else {
                    tabFilteredCases = cases.filter(c => c.status.toLowerCase() === lowerCaseFilter);
                }
                break;
            default:
                tabFilteredCases = [];
        }

        if (!searchTerm.trim()) {
            return tabFilteredCases;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
    //     return tabFilteredCases.filter(c => 
    //         (c.drawing?.childName || c.drawing?.childId || c.drawing?.childClass || '').toLowerCase().includes(lowerCaseSearchTerm)
    //     );
    // }, [cases, activeTab, completedFilter, searchTerm]);
        // If there's no search term, return the tab-filtered cases immediately
        if (!lowerCaseSearchTerm) {
            return tabFilteredCases;
        }

        // ==================================================================
        // NEW & IMPROVED SEARCH LOGIC
        // ==================================================================
        return tabFilteredCases.filter(c => {
            const drawing = c.drawing;
            // Safety check in case a case has no drawing data
            if (!drawing) return false;

            // Check each field individually for a match
            const nameMatch = (drawing.childName || '').toLowerCase().includes(lowerCaseSearchTerm);
            const idMatch = (drawing.childId || '').toLowerCase().includes(lowerCaseSearchTerm);
            const classMatch = (drawing.childClass || '').toLowerCase().includes(lowerCaseSearchTerm);

            // THE KEY FIX: Convert the age number to a string to search it
            const ageMatch = (drawing.childAge || '').toString().includes(lowerCaseSearchTerm);
            
            // Return true if ANY of the fields match
            return nameMatch || idMatch || classMatch || ageMatch;
        });

    }, [cases, activeTab, completedFilter, searchTerm]);

    const getStatusBadgeClass = (status) => {
        const normalizedStatus = (status || '').toLowerCase();
        if (normalizedStatus.includes('flagged for review')) return 'status-badge status-flagged';
        if (normalizedStatus.includes('follow-up needed')) return 'status-badge status-followup';
        if (normalizedStatus.includes('no concerns')) return 'status-badge status-completed';
        if (normalizedStatus.includes('screening')) return 'status-badge status-screening';
        return 'status-badge';
    };

    if (cases.length === 0) {
        return (
            <div className="welcome-container empty-state">
                <div className="assessor-avatar">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
                </div>
                <h1 className="welcome-title">All cases cleared!</h1>
                <p className="welcome-subtitle">Your queue is empty. Great work, {user?.username}!</p>
            </div>
        );
    }
    
    return (
        <div className="dashboard-content-card">
            <div className="dashboard-header-section">
                <h2 className="dashboard-title">Caseload Dashboard</h2>
                <p className="dashboard-subtitle">Review, analyze, and complete your assigned cases.</p>
            </div>

            <div className="dashboard-tabs">
                <button className={`tab-button ${activeTab === 'flagged' ? 'active' : ''}`} onClick={() => setActiveTab('flagged')}>
                    Flagged <span className="tab-count">{caseCounts.flagged}</span>
                </button>
                <button className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
                    Pending <span className="tab-count">{caseCounts.pending}</span>
                </button>
                <button className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
                    Completed <span className="tab-count">{caseCounts.completed}</span>
                </button>
            </div>

            <div className="table-controls">
                <div className="search-and-filter-group">
                    <input 
                        type="text"
                        className="search-input"
                        placeholder="Search by Child ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {activeTab === 'completed' && (
                        <select className="reassign-select" value={completedFilter} onChange={e => setCompletedFilter(e.target.value)}>
                            <option value="all">All Completed</option>
                            <option value="Completed - No Concerns">No Concerns</option>
                            <option value="Completed - Follow-up Needed">Follow-up Needed</option>
                        </select>
                    )}
                </div>
                <span className="cases-found-text">{filteredCases.length} cases found</span>
            </div>
            
            <div className="modern-table-container">
                <table className="modern-table">
                    <thead>
                        <tr><th>Child ID</th><th>Child Name</th><th>Age</th><th>Class</th><th>Upload Date</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        {filteredCases.map(c => (
                            <tr 
                                key={c._id} 
                                onClick={() => onSelectCase(c)}
                                className={c._id === loadingCaseId ? 'row-loading' : ''}
                            >
                                <td><strong>{c.drawing?.childId || 'N/A'}</strong></td>
                                <td>{c.drawing?.childName || 'N/A'}</td>
                                <td>{c.drawing?.childAge || 'N/A'}</td>
                                <td>{c.drawing?.childClass || 'N/A'}</td>
                                <td>{c.drawing ? new Date(c.drawing.createdAt).toLocaleDateString() : 'N/A'}</td>
                                <td><span className={getStatusBadgeClass(c.status)}>{c.status.replace('Completed - ', '')}</span></td>
                            </tr>
                        ))}
                         {filteredCases.length === 0 && (
                            <tr><td colSpan="4" className="text-center">No cases match the current filter.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


function AssessorDashboard() {
  const [view, setView] = useState('dashboard');
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '', visible: false });
  const [loadingCaseId, setLoadingCaseId] = useState(null);

  const pollingIntervalRef = useRef(null);
  const alertTimeoutRef = useRef(null);
  const { user, logout } = useAuth();

  const showAlert = useCallback((message, type = 'success') => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setAlert({ message, type, visible: true });
    alertTimeoutRef.current = setTimeout(() => setAlert(prev => ({...prev, visible: false})), 5000);
  }, []);

  const closeAlert = useCallback(() => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setAlert(prev => ({...prev, visible: false}));
  }, []);

  const fetchCases = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    try {
      const { data } = await api.getAssignedCases();
      setCases(data);
    } catch (error) {
      console.error("Failed to fetch cases", error);
      if (!isPolling) showAlert("Failed to load cases.", "error");
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    const startPolling = () => {
      stopPolling();
      pollingIntervalRef.current = setInterval(() => fetchCases(true), 30000);
    };
    const stopPolling = () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };

    if (view === 'dashboard') {
      fetchCases();
      startPolling();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [view, fetchCases]);
  
  const handleSelectCase = (caseData) => {
      setLoadingCaseId(caseData._id);
      setTimeout(() => {
        setSelectedCase(caseData);
        setView('review');
        setLoadingCaseId(null);
      }, 200);
  };

  const handleReturnToDashboard = () => {
      setSelectedCase(null);
      setView('dashboard');
  }

  const handleSaveReview = async (caseId, reportText, finalStatus) => {
    setIsSubmitting(true);
    try {
        await api.submitReview(caseId, { assessorReport: reportText, finalStatus });
        showAlert('Review submitted successfully!', 'success');
        handleReturnToDashboard();
    } catch (error) {
        showAlert('Failed to submit review. Please try again.', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="assessor-container">
      {alert.visible && <CustomAlert message={alert.message} type={alert.type} onClose={closeAlert} />}
      <header className="admin-header">
        <div className="header-left">
          <img src={logoUrl} alt="Choice Foundation" className="admin-logo" />
          <div className="header-title">
            <h2>HTP Analysis Platform</h2>
            <span className="header-subtitle">Assessor Portal</span>
          </div>
        </div>
        <div className="header-right">
          {view === 'review' && (
            <button onClick={handleReturnToDashboard} className="btn-back">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Dashboard
            </button>
          )}
          <button onClick={logout} className="logout-button">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </header>
      
      <main className="assessor-main">
        {loading ? (
          <div className="loading-state"><div className="spinner-large"></div><p>Loading cases...</p></div>
        ) : view === 'dashboard' ? (
          <DashboardView 
            cases={cases} 
            onSelectCase={handleSelectCase} 
            user={user} 
            loadingCaseId={loadingCaseId}
          />
        ) : (
          <ReviewView 
              caseData={selectedCase} 
              onSave={handleSaveReview} 
              isSubmitting={isSubmitting}
              isReadOnly={selectedCase?.status.startsWith('Completed')}
              showAlert={showAlert}
          />
        )}
      </main>
    </div>
  );
}

export default AssessorDashboard;