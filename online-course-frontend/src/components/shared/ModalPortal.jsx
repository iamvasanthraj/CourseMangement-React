import React from 'react';
import ReactDOM from 'react-dom';

const ModalPortal = ({ children, isOpen }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-portal">
      {children}
    </div>,
    document.body
  );
};

export default ModalPortal;