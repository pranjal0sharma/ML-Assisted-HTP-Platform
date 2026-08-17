import React, { useState, useEffect } from 'react';
import * as api from '../../api';

// --- Helper Component for a clean Loading State ---
const LoadingState = () => (
  <div className="loading-state">
    <div className="spinner-large"></div>
    <p>Loading dashboard metrics...</p>
  </div>
);

// --- Helper Component for a user-friendly Error State ---
const ErrorState = ({ message }) => (
  <div className="no-activity"> {/* Reusing this style for consistency */}
    <svg className="no-activity-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <h4 className="no-activity-title">Failed to Load Data</h4>
    <p className="no-activity-text">{message || "An error occurred while fetching dashboard data. Please try again later."}</p>
  </div>
);

function AdminMainDashboard({ setView, showAlert }) {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null); // Reset error state on each fetch attempt
        const [statsRes, logsRes] = await Promise.all([
          api.getAdminStats(),
          api.getAdminLogs(),
        ]);
        setStats(statsRes.data);
        setLogs(logsRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        setError("Could not connect to the server to retrieve dashboard metrics.");
      }
    };
    fetchData();
  }, []); // The empty dependency array ensures this runs only once on mount

  // --- Utility to parse log messages for improved formatting ---
  const parseLogMessage = (message) => {
    if (typeof message !== 'string' || !message) return { actor: 'System', action: 'Recorded an event.' };
    const parts = message.trim().split(' ');
    const actor = parts[0]; // Assumes the first word is the actor (e.g., "Admin")
    const action = parts.slice(1).join(' ');
    return { actor, action };
  };

  // --- Action Handlers ---
  const handleExportSystemData = async () => {
    try {
      const response = await api.exportSystemData();
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'system_data.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Use the beautiful, consistent alert system for success
      showAlert('System data has been exported successfully.');
    } catch (err) {
      console.error("Failed to export system data", err);
      // Use the alert system for errors
      showAlert('Failed to export system data.', 'error');
    }
  };
  
  // --- Conditional Rendering for different states ---
  if (error) {
    return <ErrorState message={error} />;
  }

  if (!stats) {
    return <LoadingState />;
  }

  // --- Main Render when data is available ---
  return (
    <div className="dashboard-main">
      <div className="dashboard-header-section">
        <h2 className="dashboard-title">Dashboard Analytics</h2>
        <p className="dashboard-subtitle">Real-time system performance and metrics</p>
      </div>

      <div className="modern-stats-grid">
        {/* Stat cards now correctly use the unified styles without color modifiers */}
        <div className="modern-stat-card"><div className="stat-icon"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg></div><div className="stat-content"><div className="stat-value">{stats.totalDrawingsScreened}</div><div className="stat-label">Total Drawings Processed</div></div></div>
        <div className="modern-stat-card"><div className="stat-icon"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg></div><div className="stat-content"><div className="stat-value">{stats.flaggedCasesPending}</div><div className="stat-label">Flagged Cases Pending</div></div></div>
        <div className="modern-stat-card"><div className="stat-icon"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg></div><div className="stat-content"><div className="stat-value">{stats.averageReviewTime}</div><div className="stat-label">Avg. Review Time</div></div></div>
        <div className="modern-stat-card"><div className="stat-icon"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div><div className="stat-content"><div className="stat-value">{stats.activeAssessors}</div><div className="stat-label">Active Psychologists</div></div></div>
      </div>

      <div className="dashboard-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          {/* Action buttons also use the unified style now */}
          <button className="action-btn" onClick={() => setView('users')}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg><div><div className="action-title">Manage User Accounts</div><div className="action-desc">Create, edit, and manage system users</div></div></button>
          <button className="action-btn" onClick={() => setView('cases')}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg><div><div className="action-title">Case Audit & Reassignment</div><div className="action-desc">Review and manage all assessment cases</div></div></button>
          <button className="action-btn" onClick={handleExportSystemData}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/></svg><div><div className="action-title">Export System Data</div><div className="action-desc">Download complete system data as JSON</div></div></button>
        </div>
      </div>

      <div className="dashboard-section">
        <h3 className="section-title">Recent System Activity</h3>
        <div className="activity-log-modern">
          {logs.length > 0 ? (
            logs.map(log => {
              const { actor, action } = parseLogMessage(log.message);
              return (
                <div key={log._id} className="activity-item">
                  <div className="activity-marker"><div className="activity-dot"></div></div>
                  <div className="activity-content">
                    <p className="activity-message"><strong>{actor}</strong> {action}</p>
                    <span className="activity-time">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-activity">
                <svg className="no-activity-icon" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <h4 className="no-activity-title">No Recent Activity</h4>
                <p className="no-activity-text">There are no log entries to display at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminMainDashboard;