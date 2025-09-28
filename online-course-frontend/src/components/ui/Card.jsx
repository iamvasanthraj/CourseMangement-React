import React from 'react';

const Card = ({ children, className = '' }) => {
  const cardStyle = {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    margin: '10px',
    transition: 'transform 0.2s, box-shadow 0.2s'
  };

  const hoverStyle = {
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
    }
  };

  return (
    <div 
      style={cardStyle} 
      className={`card ${className}`}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
      }}
    >
      {children}
    </div>
  );
};

export default Card;