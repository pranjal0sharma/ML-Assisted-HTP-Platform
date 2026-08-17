import React from 'react';

function CaseDetailModal({ caseData, onClose }) {
    if (!caseData) return null;

    // Helper to render ML analysis cleanly
    const renderMLAnalysis = (mlOutput) => {
        if (!mlOutput?.psychIndicators?.length) return <p className="text-muted">No ML analysis available.</p>;
        const analysis = mlOutput.psychIndicators[0];
        return (
            <>
                <p><strong>Raw Features:</strong> {(analysis.evidence || []).join(', ') || 'None'}</p>
                <p><strong>AI Interpretation:</strong></p>
                <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9em', background: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
                    {analysis.interpretation || 'No interpretation text provided.'}
                </p>
            </>
        );
    };

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Case Details for Child ID: {caseData.drawing?.childId}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-5 text-center">
                                <p><strong>Drawing</strong></p>
                                <img src={caseData.drawing?.imageURL} alt="Drawing" className="img-fluid border rounded" />
                            </div>
                            <div className="col-md-7">
                                <h5>Case Information</h5>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item"><strong>Status:</strong> {caseData.status}</li>
                                    <li className="list-group-item"><strong>Assigned To:</strong> {caseData.assessor?.username || 'Unassigned'}</li>
                                    <li className="list-group-item"><strong>Child Age:</strong> {caseData.drawing?.childAge}</li>
                                    <li className="list-group-item"><strong>Teacher Notes:</strong> {caseData.drawing?.teacherNotes || 'N/A'}</li>
                                </ul>
                                <hr/>
                                <h5>ML Analysis</h5>
                                {renderMLAnalysis(caseData.mlOutput)}
                                <hr/>
                                <h5>Assessor's Final Report</h5>
                                <p style={{ whiteSpace: 'pre-wrap' }}>
                                    {caseData.assessorReport || <span className="text-muted">No final report submitted yet.</span>}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CaseDetailModal;