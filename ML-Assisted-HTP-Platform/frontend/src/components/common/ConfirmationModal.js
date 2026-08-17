import React from 'react';
import './ConfirmationModal.css'; // We will create this CSS file next

function ConfirmationModal({ isOpen, onClose, onConfirm, title, children, confirmText = 'Confirm', confirmButtonType = 'primary' }) {
  if (!isOpen) {
    return null;
  }

  // Determine the class for the confirm button based on the type
  const confirmButtonClass = `btn-primary ${
    confirmButtonType === 'danger' ? 'btn-danger' : 'btn-success'
  }`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className={confirmButtonClass} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;