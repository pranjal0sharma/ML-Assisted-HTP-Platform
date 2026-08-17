import React, { useState, useRef } from 'react';
import * as api from '../../api';

// The component now accepts a `showAlert` prop for handling notifications consistently.
function UploadForm({ setView, onUploadSuccess, showAlert }) {
  const [formData, setFormData] = useState({ childId: '', childAge: '', childName: '', childClass: '', teacherNotes: '' });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (previewUrl) {
        // Revoke the old object URL to prevent memory leaks
        URL.revokeObjectURL(previewUrl);
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      // Use the new showAlert prop instead of a local message state.
      showAlert('Please select an image file to upload.', 'error');
      return;
    }

    setLoading(true);
    const submissionData = new FormData();
    Object.keys(formData).forEach(key => submissionData.append(key, formData[key]));
    submissionData.append('image', file);

    try {
      await api.submitDrawing(submissionData);
      // Use showAlert for success messages instead of the blocking `alert()`.
      showAlert('Drawing submitted successfully!', 'success');
      onUploadSuccess(); // This will trigger a data refresh and view change
    } catch (error) {
      showAlert('Submission failed. Please try again.', 'error');
      console.error("Submission Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uploader-card">
      {/* Replaced old header with the consistent page-header structure */}
      <div className="page-header">
        <button className="back-button" onClick={() => setView('home')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div>
          <h1 className="page-title">Upload New Drawing</h1>
          <p className="page-subtitle">Fill in the details below to submit a drawing for analysis.</p>
        </div>
      </div>
      
      {/* The message div is removed as notifications are now handled by the parent */}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
            <label>Step 1: Upload Image</label>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
            />
            <div className="image-dropzone" onClick={() => fileInputRef.current.click()}>
                {previewUrl 
                    ? <img src={previewUrl} alt="Drawing preview" /> 
                    : <p>Click here to select or capture an image</p>
                }
            </div>
        </div>

        <label style={{ marginTop: '0.5rem', display: 'block' }}>Step 2: Enter Details</label>
        <div className="form-group">
          <label htmlFor="childName">Child's Full Name</label>
          <input type="text" id="childName" name="childName" placeholder="e.g., Arjun" value={formData.childName} onChange={handleChange} required />
        </div>

        {/* NEW: Child Class Field */}
        <div className="form-group">
          <label htmlFor="childClass">Child's Class</label>
          <input type="text" id="childClass" name="childClass" placeholder="e.g., 7th Class" value={formData.childClass} onChange={handleChange} required />
        </div>
        
        <div className="form-group">
          <label htmlFor="childId">Child ID / UID</label>
          <input type="text" id="childId" name="childId" placeholder="e.g., CH-1234" value={formData.childId} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="childAge">Child Age</label>
          <input type="number" id="childAge" name="childAge" placeholder="e.g., 12" value={formData.childAge} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="teacherNotes">Notes (Optional)</label>
          <textarea id="teacherNotes" name="teacherNotes" placeholder="Any relevant observations or context..." value={formData.teacherNotes} onChange={handleChange} rows="4"></textarea>
        </div>
        
        {/* Using the standardized btn-primary class */}
        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
          {loading ? 'Submitting...' : 'Submit for Analysis'}
        </button>
      </form>
    </div>
  );
}

export default UploadForm;