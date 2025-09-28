import React from 'react';

const EnrollmentsSection = ({ 
  enrollments, 
  loading, 
  onUnenroll, 
  onRate, 
  canRateCourse, 
  user, 
  onGenerateCertificate, 
  onStartTest 
}) => {
  if (!enrollments.length) {
    return (
      <div className="quantum-enrollments-section">
        <div className="section-header">
          <h2 className="quantum-text-gradient">🎓 My Enrollments (0)</h2>
        </div>
        <div className="empty-state">
          <p>You haven't enrolled in any courses yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quantum-enrollments-section">
      <div className="section-header">
        <h2 className="quantum-text-gradient">🎓 My Enrollments ({enrollments.length})</h2>
      </div>
      <div className="quantum-enrollments-list">
        {enrollments.map(enrollment => {
          if (!enrollment || !enrollment.enrollmentId) return null;

          const course = enrollment.course || {};

          return (
            <div key={enrollment.enrollmentId} className="quantum-card quantum-glass">
              <div className="enrollment-info">
                <span className="course-title quantum-glow-text">
                  {course.title || `Course ID: ${enrollment.courseId}`}
                </span>
                <span className="course-category quantum-badge">
                  {course.category || 'Category not available'}
                </span>
                <span className="instructor">
                  Instructor: {course.instructorName || 'Not available'}
                </span>
                <span className="course-price">
                  Price: ${course.price || 'N/A'}
                </span>
                <span className="enrollment-date">
                  Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                </span>
                
                {/* ✅ Enhanced Completion Status */}
                <div className={`completion-status ${enrollment.completed ? 'completed' : 'in-progress'}`}>
                  {enrollment.completed ? (
                    <span className="status-badge completed">
                      ✅ Completed on {new Date(enrollment.completionDate).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="status-badge in-progress">
                      📚 In Progress - Take the test to complete
                    </span>
                  )}
                </div>
              </div>
              
              <div className="enrollment-actions">
                {/* Test Button - Only show if not completed */}
                {!enrollment.completed && (
                  <button 
                    onClick={() => onStartTest(enrollment)}
                    disabled={loading}
                    className="quantum-btn quantum-test-btn"
                    title="Take the final test to complete the course"
                  >
                    🧪 Start Test
                  </button>
                )}
                
                {/* Certificate Button - Only show if completed */}
                {enrollment.completed && (
                  <button
                    onClick={() => onGenerateCertificate({
                      ...enrollment,
                      studentName: enrollment.studentName, 
                      studentId: enrollment.studentId,
                      course: enrollment.course
                    })}
                    className="quantum-btn quantum-certificate-btn"
                    title="Download your course completion certificate"
                  >
                    🎓 Get Certificate
                  </button>
                )}
                
                {/* Rate Button - Only show if enrolled and can rate */}
                {canRateCourse(enrollment.courseId) && (
                  <button 
                    onClick={() => onRate(course)}
                    className="quantum-btn quantum-rate-btn"
                    title="Rate this course"
                  >
                    ⭐ Rate Course
                  </button>
                )}
                
                {/* Unenroll Button */}
                <button 
                  onClick={() => onUnenroll(enrollment.enrollmentId)}
                  disabled={loading}
                  className="quantum-btn quantum-unenroll-btn"
                  title="Unenroll from this course"
                >
                  {loading ? '⏳' : '❌ Unenroll'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(EnrollmentsSection);