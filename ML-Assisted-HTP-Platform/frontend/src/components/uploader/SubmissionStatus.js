import React, { useState, useMemo } from 'react';
import { generatePdfReport } from '../../utils/generateReport'; // Ensure this path is correct

/**
 * Renders the user's submission history with search and PDF download capabilities.
 * @param {object} props
 * @param {function} props.setView - Function to change the parent component's view.
 * @param {Array} props.history - Array of submission/case history objects.
 * @param {boolean} props.loading - Loading state from the parent.
 * @param {function} props.showAlert - Function to display an alert message.
 */
function SubmissionStatus({ setView, history, loading, showAlert }) {
    
    // State for the search term input field
    const [searchTerm, setSearchTerm] = useState('');

    /**
     * Memoized filtering logic to efficiently search the history.
     * It only recalculates when the history data or the search term changes.
     */
    const filteredHistory = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.trim().toLowerCase();

        if (!lowerCaseSearchTerm) {
            return history; // Return the full list if search is empty
        }

        return history.filter(item => {
            const nameMatch = (item.childName || '').toLowerCase().includes(lowerCaseSearchTerm);
            const idMatch = (item.childId || '').toLowerCase().includes(lowerCaseSearchTerm);
            
            // Include the item if the search term is found in either the name or ID
            return nameMatch || idMatch;
        });
    }, [history, searchTerm]);

    /**
     * Handles the click event for the download button on each row.
     * Formats the history item into the structure expected by the PDF generator.
     * @param {Event} e - The click event object.
     * @param {object} caseItem - The specific history item for the row.
     */
    const handleDownloadReport = (e, caseItem) => {
        // Stop the click from bubbling up, which is good practice for buttons in clickable rows
        e.stopPropagation();

        try {
            // The PDF generator expects a specific 'caseData' object structure.
            // We must format our 'caseItem' from the history prop to match it.
            const formattedCaseData = {
                _id: caseItem.caseId || caseItem._id,
                status: caseItem.caseStatus,
                assessorReport: caseItem.assessorReport || '',
                mlOutput: caseItem.mlOutput || null,
                drawing: {
                    childId: caseItem.childId,
                    childName: caseItem.childName,
                    childAge: caseItem.childAge,
                    imageURL: caseItem.imageURL,
                    createdAt: caseItem.createdAt,
                    uploadedBy: caseItem.uploadedBy
                },
                assessor: caseItem.assessor || null,
            };
            
            generatePdfReport(formattedCaseData);
        } catch (error) {
            console.error("Error generating PDF from submission status:", error);
            showAlert("An error occurred while generating the PDF. Please check the console.", "error");
        }
    };

    /**
     * Determines the CSS class for the status badge based on the case status text.
     */
    const getStatusBadgeClass = (status) => {
        const normalizedStatus = (status || '').toLowerCase();
        if (normalizedStatus.includes('flagged for review')) return 'status-badge status-flagged';
        if (normalizedStatus.includes('follow-up')) return 'status-badge status-followup';
        if (normalizedStatus.includes('no concerns')) return 'status-badge status-completed';
        if (normalizedStatus.includes('screening')) return 'status-badge status-screening';
        return 'status-badge';
    };

    /**
     * Determines the CSS class for the entire table row to visually highlight cases.
     */
    const getRowClass = (status) => {
        const normalizedStatus = (status || '').toLowerCase();
        if (normalizedStatus.includes('flagged for review')) return 'row-flagged';
        if (normalizedStatus.includes('follow-up')) return 'row-followup';
        if (normalizedStatus.includes('no concerns')) return 'row-completed';
        if (normalizedStatus.includes('screening')) return 'row-screening';
        return '';
    };

    /**
     * Renders the main content: either a loading spinner, an empty state message,
     * or the table with submission data.
     */
    const renderContent = () => {
        if (loading) {
            return (
                <div className="loading-state">
                    <div className="spinner-large"></div>
                    <p>Loading submissions...</p>
                </div>
            );
        }

        if (!history || history.length === 0) {
            return (
                <div className="no-activity">
                    <svg className="no-activity-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="no-activity-title">No Submissions Yet</h3>
                    <p className="no-activity-text">When you upload a drawing, its status will appear here.</p>
                </div>
            );
        }

        return (
            <>
                {/* This div reuses existing dashboard styles for consistency */}
                <div className="table-controls" style={{ padding: '0 1rem 1rem 1rem' }}>
                    {/* This input reuses existing dashboard styles */}
                    <input 
                        type="text"
                        className="search-input"
                        placeholder="Search by Child Name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="status-table-container">
                    <table className="submission-table">
                        <thead>
                            <tr>
                                <th>Child ID</th>
                                <th>Child Name</th>
                                <th>Upload Date</th>
                                <th>Status</th>
                                {/* <th>Actions</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Map over the filtered list */}
                            {filteredHistory.map(item => (
                                <tr key={item._id} className={getRowClass(item.caseStatus)}>
                                    <td><strong>{item.childId}</strong></td>
                                    <td>{item.childName}</td>
                                    <td>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                    <td>
                                        <span className={getStatusBadgeClass(item.caseStatus)}>
                                            {item.caseStatus.replace('Completed - ', '')}
                                        </span>
                                    </td>
                                    {/* <td>
                                        <button 
                                            className="back-button" // REUSING THIS CLASS
                                            style={{ border: 'none' }} // Ensure no border interferes
                                            title="Download Report"
                                            onClick={(e) => handleDownloadReport(e, item)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="7 10 12 15 17 10"></polyline>
                                                <line x1="12" y1="15" x2="12" y2="3"></line>
                                            </svg>
                                        </button>
                                    </td> */}
                                </tr>
                            ))}
                            {/* Show a message if the search finds nothing */}
                            {filteredHistory.length === 0 && history.length > 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center' }}>No submissions match your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    return (
        <div className="uploader-card">
            <div className="page-header">
                <button className="back-button" onClick={() => setView('home')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <div>
                    <h1 className="page-title">Submission Status</h1>
                    <p className="page-subtitle">This table shows all your submitted drawings and their current analysis status.</p>
                </div>
            </div>
            
            {renderContent()}
        </div>
    );
}

export default SubmissionStatus;