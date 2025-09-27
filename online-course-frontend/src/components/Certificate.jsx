import React from 'react';
import './Certificate.css';

const Certificate = ({ enrollment, onClose }) => {
  if (!enrollment) return null;

  const downloadCertificate = () => {
    const certificateContent = document.getElementById('certificate-content');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 1200;
    canvas.height = 800;
    
    // Draw certificate background
    context.fillStyle = '#fafafa';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw border
    context.strokeStyle = '#d4af37';
    context.lineWidth = 15;
    context.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
    
    // Draw content
    context.fillStyle = '#333';
    context.textAlign = 'center';
    
    // Title
    context.font = 'bold 48px "Times New Roman", serif';
    context.fillText('CERTIFICATE OF COMPLETION', canvas.width / 2, 150);
    
    // Student name
    context.font = '36px "Times New Roman", serif';
    context.fillText(`This is to certify that`, canvas.width / 2, 250);
    context.font = 'bold 42px "Times New Roman", serif';
    context.fillText(enrollment.studentName || 'Student', canvas.width / 2, 320);
    
    // Course details
    context.font = '32px "Times New Roman", serif';
    context.fillText(`has successfully completed the course`, canvas.width / 2, 400);
    context.font = 'bold 36px "Times New Roman", serif';
    context.fillText(enrollment.course?.title || 'Course', canvas.width / 2, 470);
    
    // Date and instructor
    context.font = '28px "Times New Roman", serif';
    context.fillText(`Completed on: ${new Date(enrollment.completionDate).toLocaleDateString()}`, canvas.width / 2, 570);
    context.fillText(`Instructor: ${enrollment.course?.instructorName || 'Instructor'}`, canvas.width / 2, 620);
    
    // Convert to image and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate-${enrollment.course?.title}-${enrollment.studentName}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="certificate-modal-overlay">
      <div className="certificate-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div id="certificate-content" className="certificate-content">
          <div className="certificate-border">
            <div className="certificate-header">
              <h1>CERTIFICATE OF COMPLETION</h1>
            </div>
            
            <div className="certificate-body">
              <p className="presented-to">This is to certify that</p>
              <h2 className="student-name">{enrollment.studentName || 'Student'}</h2>
              <p className="completion-text">has successfully completed the course</p>
              <h3 className="course-title">{enrollment.course?.title || 'Course'}</h3>
              
              <div className="certificate-details">
                <p>Completed on: {new Date(enrollment.completionDate).toLocaleDateString()}</p>
                <p>Instructor: {enrollment.course?.instructorName || 'Instructor'}</p>
              </div>
            </div>
            
            <div className="certificate-footer">
              <div className="signature">
                <div className="signature-line"></div>
                <p>Instructor Signature</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="certificate-actions">
          <button onClick={downloadCertificate} className="download-btn">
            📥 Download Certificate
          </button>
          <button onClick={onClose} className="close-certificate">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Certificate;