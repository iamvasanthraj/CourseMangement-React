import React from 'react';
import './TestModal.css';

const TestModal = ({ questions, onConfirm, onClose }) => {
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleStartTest = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🚀 Start Test button clicked in modal');
    
    if (onConfirm && typeof onConfirm === 'function') {
      console.log('✅ Calling onConfirm function');
      onConfirm();
    } else {
      console.error('❌ onConfirm is not a function or not provided');
    }
  };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal test-modal" onClick={handleModalClick}>
        <div className="modal-header">
          <h3>Start Test</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="test-instructions">
            <h4>Test Instructions:</h4>
            <ul>
              <li>📝 Total Questions: {questions?.length || 0} (Randomly Selected)</li>
              <li>⏰ Time Limit: 5 minutes</li>
              <li>✅ Passing Score: 6 out of {questions?.length || 10}</li>
              <li>🔒 One question at a time</li>
              <li>🎲 Questions are randomly selected each time</li>
              <li>📊 Results shown immediately after completion</li>
            </ul>
            <p className="warning-text">
              ⚠️ Once started, the timer cannot be paused!
            </p>
          </div>
          
          <div className="modal-actions">
            <button 
              onClick={handleStartTest}
              className="quantum-btn quantum-action-btn"
            >
              🚀 Start Test
            </button>

            <button 
              onClick={handleClose}
              className="quantum-btn quantum-btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestModal;