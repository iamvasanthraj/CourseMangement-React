import React from 'react';
import './Modal.css'; // or Modal.module.css if you prefer

const Modal = ({ children, onClose, title }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        {title && (
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        )}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;