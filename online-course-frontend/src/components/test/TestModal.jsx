import React from 'react';
import './TestModal.css';

const TestModal = ({ questions, onConfirm, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal test-modal">
        <div className="modal-header">
          <h3>Start Test</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="test-instructions">
            <h4>Test Instructions:</h4>
            <ul>
              <li>📝 Total Questions: {questions.length}</li>
              <li>⏰ Time Limit: 5 minutes</li>
              <li>✅ Passing Score: 6 out of 10</li>
              <li>🔒 One question at a time</li>
              <li>📊 Results shown immediately after completion</li>
            </ul>
            <p className="warning-text">
              ⚠️ Once started, the timer cannot be paused!
            </p>
          </div>
          
          <div className="modal-actions">
            <button 
  onClick={onConfirm}
  className="quantum-btn quantum-action-btn"
>
  🚀 Start Test
</button>

            <button 
              onClick={onClose}
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