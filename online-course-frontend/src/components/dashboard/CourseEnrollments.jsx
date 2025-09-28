import React from 'react';
import "../../styles/CourseEnrollments.css";

const CourseEnrollments = ({ enrollments, loading, onMarkComplete, onGenerateCertificate, onClose }) => {
  return (
    <div className="enrollments-modal-overlay">
      <div className="enrollments-modal">
        <div className="enrollments-header">
          <h3>📚 Course Enrollments</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {loading ? (
          <div className="enrollments-loading">Loading enrollments...</div>
        ) : enrollments.length === 0 ? (
          <div className="enrollments-empty">No enrollments yet.</div>
        ) : (
          <table className="enrollments-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Enrollment Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment) => (
                <tr key={enrollment.enrollmentId}>
                  <td>{enrollment.studentName}</td>
                  <td>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</td>
                  <td>{enrollment.completed ? 'Completed' : 'In Progress'}</td>
                  <td className="actions-cell">
                    {!enrollment.completed && (
                      <button
                        className="mark-complete-btn"
                        onClick={() => onMarkComplete(enrollment.enrollmentId)}
                      >
                        Mark Complete
                      </button>
                    )}
                    <button
                      className="generate-cert-btn"
                      onClick={() => onGenerateCertificate(enrollment)}
                    >
                      Certificate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CourseEnrollments;
