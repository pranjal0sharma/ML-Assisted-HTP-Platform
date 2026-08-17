import React, { useState } from 'react';
import { generatePdfReport } from '../utils/generateReport';
import ConfirmationModal from './common/ConfirmationModal';

function ReviewView({ caseData, onSave, isSubmitting, isReadOnly, showAlert }) {
  const [reportText, setReportText] = useState(caseData.assessorReport || '');
  const [isEditing, setIsEditing] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', statusToConfirm: null, confirmButtonType: 'primary' });

  const openConfirmationModal = (status) => {
    const isFlagging = status.toLowerCase().includes('follow-up');
    setModalState({
      isOpen: true,
      title: 'Confirm Submission',
      message: `Are you sure you want to submit this case and mark it as "${isFlagging ? 'Follow-up Needed' : 'No Concerns'}"?`,
      statusToConfirm: status,
      confirmButtonType: isFlagging ? 'danger' : 'success'
    });
  };

  const handleConfirmSave = () => {
    const { statusToConfirm } = modalState;
    if (!statusToConfirm) return;

    if (statusToConfirm.toLowerCase().includes('follow-up') && !reportText.trim()) {
      showAlert('A report is required when flagging a case for follow-up.', 'error');
      closeConfirmationModal();
      return;
    }
    
    onSave(caseData._id, reportText, statusToConfirm);
    if (isEditing) setIsEditing(false);
    closeConfirmationModal();
  };
  
  const closeConfirmationModal = () => {
      setModalState({ isOpen: false, title: '', message: '', statusToConfirm: null, confirmButtonType: 'primary' });
  };

  const handleCancelEdit = () => {
    setReportText(caseData.assessorReport || '');
    setIsEditing(false);
  };

  // **IMPROVEMENT:** Replaced alert() with the consistent showAlert for error feedback
  // const handleDownload = () => {
  //   try {
  //       generatePdfReport(caseData);
  //   } catch (error) {
  //       console.error("Error generating PDF report:", error);
  //       showAlert("An error occurred while generating the PDF. Please check the console.", "error");
  //   }
  // };

  const handleDownload = () => {
    try {
        // Create a new, up-to-date object for the report.
        // 1. It starts with the most recent caseData from props (which should include mlOutput).
        // 2. It overwrites the assessorReport with the most recent text from the component's state.
        const reportData = {
            ...caseData,
            assessorReport: reportText,
        };
        
        // Pass this complete, fresh object to the PDF generator.
        generatePdfReport(reportData);

    } catch (error) {
        console.error("Error generating PDF report:", error);
        showAlert("An error occurred while generating the PDF. Please check the console.", "error");
    }
  };
  
  const renderInitialAnalysis = (analysisData) => {
    if (!analysisData?.psychIndicators?.length) {
      return <p className="text-muted">No automated analysis was generated for this case.</p>;
    }
    const analysis = analysisData.psychIndicators[0];
    const rawFeatures = analysis.evidence || [];
    return (
      <>
        <h6>Raw Visual Features Detected:</h6>
        <div className="feature-badges-container">
          {rawFeatures.length > 0 ? (
            rawFeatures.map((feature, index) => <span key={index} className="feature-badge">{feature}</span>)
          ) : (<p className="text-muted">No specific visual features were identified.</p>)}
        </div>
        <h6 className="section-subtitle">Generated Interpretation:</h6>
        <p className="interpretation-text">{analysis.interpretation || "No interpretation text was provided."}</p>
      </>
    );
  };
  
  const getStatusBadgeClass = (status) => {
    const normalizedStatus = (status || '').toLowerCase();
    if (normalizedStatus.includes('flagged for review')) return 'status-badge status-flagged';
    if (normalizedStatus.includes('follow-up needed')) return 'status-badge status-followup';
    if (normalizedStatus.includes('no concerns')) return 'status-badge status-completed';
    if (normalizedStatus.includes('screening')) return 'status-badge status-screening';
    return 'status-badge';
  };

  const showActionButtons = !isReadOnly || isEditing;

  return (
    <>
      <div className="review-page-container">
        <div className="dashboard-header-section">
          <h2 className="dashboard-title">{isReadOnly ? 'View Completed Case' : 'Review Case'}: {caseData.drawing.childName} ({caseData.drawing.childId})</h2>
          <p className="dashboard-subtitle">Analyze the drawing, initial analysis, and contextual data to form your assessment.</p>
        </div>
        <div className="review-grid-container">
          <div className="review-column">
            <div className="modern-card">
              <h3 className="card-title">Child's Drawing</h3>
              <div className="drawing-image-container">
                <a href={caseData.drawing.imageURL} target="_blank" rel="noopener noreferrer">
                    <img id={`drawing-image-${caseData._id}`} src={caseData.drawing.imageURL} alt={`Drawing by ${caseData.drawing.childId}`} />
                </a>
                <p className="image-caption">Click image to view in full size</p>
              </div>
            </div>
            <div className="modern-card">
              <h3 className="card-title">Contextual Data</h3>
              <div className="context-grid">
                <div><strong>Child's Name:</strong><span>{caseData.drawing.childName || 'N/A'}</span></div>
                <div><strong>Class:</strong><span>{caseData.drawing.childClass || 'N/A'}</span></div>
                <div><strong>Child ID:</strong><span>{caseData.drawing.childId}</span></div>
                <div><strong>Age:</strong><span>{caseData.drawing.childAge}</span></div>
                <div><strong>Uploaded On:</strong><span>{new Date(caseData.drawing.createdAt).toLocaleDateString()}</span></div>
                <div><strong>Uploaded By:</strong><span>{caseData.drawing.uploadedBy?.username || 'N/A'}</span></div>
                <div className="context-notes"><strong>Teacher Notes:</strong><span>{caseData.drawing.teacherNotes || 'None provided.'}</span></div>
              </div>
            </div>
          </div>
          <div className="review-column">
            <div className="modern-card">
              {/* **IMPROVEMENT:** Title now matches the PDF section for consistency */}
              <h3 className="card-title">Initial Automated Analysis</h3>
              <div className="interpretation-container">{renderInitialAnalysis(caseData.mlOutput)}</div>
              <small className="card-footer-note">Note: This initial analysis requires professional validation.</small>
            </div>
            <div className="modern-card">
              {/* **IMPROVEMENT:** Title now matches the PDF section for consistency */}
              <h3 className="card-title">Assessor's Final Report</h3>
              {isReadOnly && (
                <div className="final-status-header">
                  <span>Final Status:</span>
                  <span className={getStatusBadgeClass(caseData.status)}>{caseData.status.replace('Completed - ', '')}</span>
                </div>
              )}
              <textarea
                className="form-textarea"
                placeholder={isReadOnly && !reportText ? "No report was written for this case." : "Based on the drawing, initial findings, and contextual data, the assessment is..."}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                readOnly={isReadOnly && !isEditing}
              />
            </div>
            {showActionButtons && (
               <div className="modern-card action-card">
                 <h3 className="card-title">{isEditing ? 'Update Final Assessment' : 'Submit Final Assessment'}</h3>
                 <p className="card-subtitle">Select one of the options below to finalize your report.</p>
                 <div className="action-buttons-grid">
                  <button className="btn-primary btn-success" onClick={() => openConfirmationModal('Completed - No Concerns')} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit as Clear'}</button>
                  <button className="btn-primary btn-danger" onClick={() => openConfirmationModal('Completed - Follow-up Needed')} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit & Flag for Follow-up'}</button>
                 </div>
                  {isEditing && (<button className="btn-secondary" onClick={handleCancelEdit} disabled={isSubmitting}>Cancel Edit</button>)}
               </div>
            )}
            {isReadOnly && !isEditing && (
              <div className="modern-card">
                <h3 className="card-title">Case Actions</h3>
                <div className="action-buttons-grid">
                  <button className="btn-secondary" onClick={() => setIsEditing(true)}>Edit Report</button>
                  <button className="btn-primary btn-success" onClick={handleDownload}>Download Report (PDF)</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleConfirmSave}
        title={modalState.title}
        confirmText="Yes, Submit"
        confirmButtonType={modalState.confirmButtonType}
      >
        <p>{modalState.message}</p>
      </ConfirmationModal>
    </>
  );
}

export default ReviewView;