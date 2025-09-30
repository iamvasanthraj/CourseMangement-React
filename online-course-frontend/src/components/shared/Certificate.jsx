import React from 'react';
import './Certificate.css';

const Certificate = ({
  enrollment,
  onClose = () => {}
}) => {
  if (!enrollment) return null;

  const {
    studentName = 'Student Name',
    studentId = 'N/A',
    course = {},
    completionDate = new Date()
  } = enrollment;

  const { title: courseTitle = 'Course Title', category: courseCategory = 'Category', instructorName = 'Instructor Name' } = course;

  const downloadCertificate = () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = 1200;
    canvas.height = 700;

    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#fdfcfb');
    gradient.addColorStop(1, '#f1f5f9');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = '#fcd34d';
    context.lineWidth = 12;
    context.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    context.fillStyle = '#1e3a8a';
    context.font = 'bold 48px Times New Roman';
    context.textAlign = 'center';
    context.fillText('CERTIFICATE OF COMPLETION', canvas.width / 2, 100);

    context.fillStyle = '#475569';
    context.font = 'bold 42px Times New Roman';
    context.fillText(studentName, canvas.width / 2, 220);

    context.fillStyle = '#1e40af';
    context.font = 'bold 36px Times New Roman';
    context.fillText(courseTitle, canvas.width / 2, 320);

    context.fillStyle = '#64748b';
    context.font = '28px Times New Roman';
    context.fillText(`Category: ${courseCategory}`, canvas.width / 2, 400);
    context.fillText(`Instructor: ${instructorName}`, canvas.width / 2, 450);
    context.fillText(`Completed on: ${new Date(completionDate).toLocaleDateString()}`, canvas.width / 2, 500);

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate-${courseTitle}-${studentName.replace(/\s+/g, '-')}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="certificate-modal-overlay">
      <div className="certificate-modal">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <div className="certificate-container">
          <div className="certificate-header">
            <h1>CERTIFICATE OF COMPLETION</h1>
          </div>

          <div className="certificate-body">
            <p className="presented-to">This is to certify that</p>
            <h2 className="student-name">{studentName}</h2>
            <p className="completion-text">has successfully completed the course</p>
            <h3 className="course-title">{courseTitle}</h3>
            <p className="course-category"><strong>Category:</strong> {courseCategory}</p>

            <div className="certificate-details">
              <p><strong>Completed on:</strong> {new Date(completionDate).toLocaleDateString()}</p>
              <p><strong>Instructor:</strong> {instructorName}</p>
              <p><strong>Student ID:</strong> {studentId}</p>
            </div>
          </div>

          <div className="certificate-footer">
            <div className="signature">
              <div className="signature-line"></div>
              <p>Instructor Signature</p>
            </div>
            <div className="issuing-authority">
              <p>Online Course System</p>
              <p>Date of Issue: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="certificate-actions">
          <button onClick={downloadCertificate} className="download-btn">📥 Download Certificate</button>
          <button onClick={onClose} className="close-certificate">Close</button>
        </div>
      </div>
    </div>
  );
};

export default Certificate;