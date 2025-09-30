// components/shared/UnenrollConfirmationModal.jsx
import React from 'react';
import './UnenrollConfirmationModal.css';

const UnenrollConfirmationModal = ({ 
  courseTitle, 
  onConfirm, 
  onCancel, 
  loading = false 
}) => {
  return (
    <div className="unenroll-modal-overlay">
      <div className="unenroll-modal-container">
        <div className="unenroll-modal-glass">
          <div className="modal-header">
            <h2 className="modal-title">Confirm Unenrollment</h2>
          </div>

          <div className="modal-content">
            <div className="warning-icon">⚠️</div>
            <h3 className="warning-title">Are you sure?</h3>
            <p className="warning-message">
              You are about to unenroll from <strong>"{courseTitle}"</strong>
            </p>
            <div className="warning-details">
              <p>This action will:</p>
              <ul>
                <li>❌ Remove this course from your enrollments</li>
                <li>📊 Delete all your progress and test results</li>
                <li>🎯 Return the course to available courses</li>
                <li>🔒 This action cannot be undone</li>
              </ul>
            </div>
          </div>

          <div className="modal-actions">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="confirm-unenroll-btn"
            >
              {loading ? '⏳ Unenrolling...' : '❌ Yes, Unenroll'}
            </button>
            <button
              onClick={onCancel}
              disabled={loading}
              className="cancel-unenroll-btn"
            >
              🚫 Keep Enrolled
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnenrollConfirmationModal;