import React from 'react';
import './EnrollmentsModal.css';

const EnrollmentsModal = ({ enrollments, loading, onMarkComplete, onGenerateCertificate, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal enrollments-modal">
        <div className="modal-header">
          <h3>Course Enrollments</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="enrollments-list">
          {enrollments.length === 0 ? (
            <p>No students have enrolled in this course yet.</p>
          ) : (
            enrollments.map((enrollment) => (
              <div key={enrollment.enrollmentId} className="enrollment-item">
                <div className="enrollment-info">
                  <span className="student-name">{enrollment.studentName}</span>
                  <span className="enrollment-date">
                    Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </span>
                  <span className={`status ${enrollment.completed ? 'completed' : 'in-progress'}`}>
                    {enrollment.completed ? '✅ Completed' : '📚 In Progress'}
                  </span>
                  {enrollment.completed && enrollment.completionDate && (
                    <span className="completion-date">
                      Completed: {new Date(enrollment.completionDate).toLocaleDateString()}
                    </span>
                  )}
                  <span className="course-category">
                    Course: {enrollment.course?.title} ({enrollment.course?.category})
                  </span>
                </div>
                
                <div className="enrollment-actions">
                  {!enrollment.completed ? (
                    <button
                      onClick={() => onMarkComplete(enrollment.enrollmentId)}
                      disabled={loading}
                      className="complete-btn"
                    >
                      {loading ? '⏳' : '✅ Mark Complete'}
                    </button>
                  ) : (
                    <button
                      onClick={() => onGenerateCertificate({
                        ...enrollment,
                        studentName: enrollment.studentName,
                        studentId: enrollment.studentId,
                        course: {
                          title: enrollment.course?.title,
                          category: enrollment.course?.category,
                          instructorName: enrollment.course?.instructorName
                        }
                      })}
                      className="certificate-btn"
                    >
                      🎓 Generate Certificate
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentsModal;