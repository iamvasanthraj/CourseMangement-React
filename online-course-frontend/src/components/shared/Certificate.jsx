// components/shared/Certificate.jsx
import React, { useState, useEffect } from 'react';
import './Certificate.css';

const Certificate = ({
  enrollment,
  onClose = () => {}
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  
  useEffect(() => {
    // Auto-hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!enrollment) return null;

  const {
    studentName = 'Student Name',
    course = {},
    completionDate = new Date()
  } = enrollment;

  const { title: courseTitle = 'Course Title', instructorName = 'Instructor Name' } = course;

  const downloadCertificate = () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = 1200;
    canvas.height = 800;

    // Premium gradient background
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(0.5, '#f1f5f9');
    gradient.addColorStop(1, '#e2e8f0');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Gold border
    context.strokeStyle = '#d4af37';
    context.lineWidth = 15;
    context.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Inner border
    context.strokeStyle = '#1e40af';
    context.lineWidth = 3;
    context.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // Title with shadow
    context.shadowColor = 'rgba(0, 0, 0, 0.1)';
    context.shadowBlur = 10;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    
    context.fillStyle = '#1e3a8a';
    context.font = 'bold 52px "Playfair Display", serif';
    context.textAlign = 'center';
    context.fillText('CERTIFICATE OF ACHIEVEMENT', canvas.width / 2, 120);

    // Reset shadow
    context.shadowColor = 'transparent';

    // Decorative elements
    context.fillStyle = '#d4af37';
    context.font = 'italic 24px "Georgia", serif';
    context.fillText('• • •', canvas.width / 2, 160);

    // Student name with elegant styling
    context.fillStyle = '#1e293b';
    context.font = 'bold 48px "Playfair Display", serif';
    context.fillText(studentName, canvas.width / 2, 240);

    // Course title
    context.fillStyle = '#334155';
    context.font = 'italic 36px "Georgia", serif';
    context.fillText('has successfully completed', canvas.width / 2, 300);

    context.fillStyle = '#1e40af';
    context.font = 'bold 40px "Playfair Display", serif';
    context.fillText(`"${courseTitle}"`, canvas.width / 2, 360);

    // Simple details section
    context.fillStyle = '#475569';
    context.font = '28px "Georgia", serif';
    context.textAlign = 'center';
    
    context.fillText(`Instructor: ${instructorName}`, canvas.width / 2, 450);
    context.fillText(`Completed on: ${new Date(completionDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, canvas.width / 2, 500);

    // Signatures
    context.fillStyle = '#64748b';
    context.font = '24px "Georgia", serif';
    
    // Instructor signature
    context.fillText('_________________________', 300, 650);
    context.fillText(instructorName, 300, 680);
    context.fillText('Course Instructor', 300, 710);

    // Institution signature
    context.fillText('_________________________', canvas.width - 300, 650);
    context.fillText('Online Course System', canvas.width - 300, 680);
    context.fillText('Date of Issue', canvas.width - 300, 710);

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate-${courseTitle.replace(/\s+/g, '-')}-${studentName.replace(/\s+/g, '-')}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="certificate-modal-overlay">
      {/* Celebration Confetti */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      )}

      {/* Celebration Message */}
      {showConfetti && (
        <div className="celebration-message">
          <div className="celebration-text">🎉 Congratulations! 🎉</div>
        </div>
      )}

      <div className="certificate-modal">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        
        <div className="certificate-container">
          {/* Certificate Header */}
          <div className="certificate-header">
            <div className="certificate-badge">🏆</div>
            <h1 className="certificate-title">CERTIFICATE OF ACHIEVEMENT</h1>
            <div className="certificate-subtitle">This Certificate is Proudly Presented To</div>
          </div>

          {/* Certificate Body */}
          <div className="certificate-body">
            <div className="student-name-container">
              <h2 className="student-name">{studentName}</h2>
            </div>
            
            <div className="achievement-text">
              <p className="completion-statement">has successfully completed the course</p>
              <h3 className="course-title">"{courseTitle}"</h3>
            </div>

            {/* Simplified Details */}
            <div className="certificate-details-simple">
              <div className="detail-item">
                <span className="detail-label">Instructor:</span>
                <span className="detail-value">{instructorName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Completed on:</span>
                <span className="detail-value">
                  {new Date(completionDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Certificate Footer */}
          <div className="certificate-footer">
            <div className="signature-section">
              <div className="signature-box">
                <div className="signature-line"></div>
                <p className="signature-name">{instructorName}</p>
                <p className="signature-title">Course Instructor</p>
              </div>
            </div>
            
            <div className="institution-section">
              <div className="seal">
                <div className="seal-inner">
                  <span>OCS</span>
                </div>
              </div>
              <p className="institution-name">Online Course System</p>
              <p className="issue-date">
                Issued on {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="corner-decoration top-left"></div>
          <div className="corner-decoration top-right"></div>
          <div className="corner-decoration bottom-left"></div>
          <div className="corner-decoration bottom-right"></div>
        </div>

        {/* Actions */}
        <div className="certificate-actions">
          <button onClick={downloadCertificate} className="download-btn premium-download">
            <span className="download-icon">📥</span>
            Download Certificate
          </button>
          <button onClick={onClose} className="close-certificate">Close Preview</button>
        </div>
      </div>
    </div>
  );
};

export default Certificate;