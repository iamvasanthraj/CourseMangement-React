import React from 'react';

const CourseCard = ({ 
  course, 
  user, 
  isEnrolled, 
  enrollmentId, 
  canRate, 
  onEnroll, 
  onUnenroll, 
  onRate, 
  onDelete, 
  onEdit, 
  onViewEnrollments, 
  loading 
}) => {
  if (!course) return null;

  return (
    <div className="quantum-card quantum-hover-lift quantum-3d">
      <div className="quantum-card-header">
        <div>
          <h3 className="quantum-glow-text">{course.title}</h3>
          <span className="quantum-badge">{course.category}</span>
        </div>
        <div className="quantum-card-meta">
          <span className="quantum-tag">{course.batch}</span>
          {user?.role === 'INSTRUCTOR' && course.instructorId === user.userId && (
            <span className="quantum-badge quantum-enroll">Your Course</span>
          )}
        </div>
      </div>
      
      <p className="quantum-card-description">{course.description}</p>
      
      <div className="quantum-card-details">
        <span className="instructor">Instructor: {course.instructorName}</span>
        <span className="price">${course.price}</span>
        <div className="rating">
          ⭐ {course.rating > 0 ? course.rating.toFixed(1) : 'No ratings'} ({course.totalRatings || 0} ratings)
        </div>
      </div>

      <div className="quantum-card-actions">
        {user?.role === 'STUDENT' && (
          <>
            {!isEnrolled ? (
              <button 
                onClick={() => onEnroll(course.id)}
                disabled={loading}
                className="quantum-btn quantum-action-btn quantum-enroll"
              >
                {loading ? '⏳' : '📝 Enroll'}
              </button>
            ) : (
              <button 
                onClick={() => onUnenroll(enrollmentId)}
                disabled={loading}
                className="quantum-btn quantum-action-btn quantum-unenroll"
              >
                {loading ? '⏳' : '❌ Unenroll'}
              </button>
            )}
            {canRate && (
              <button onClick={() => onRate(course)} className="quantum-btn quantum-action-btn quantum-rate">
                ⭐ Rate
              </button>
            )}
          </>
        )}
        {user?.role === 'INSTRUCTOR' && course.instructorId === user.userId && (
          <div className="instructor-actions">
            <button 
              onClick={() => onViewEnrollments(course.id)}
              className="quantum-btn quantum-action-btn"
            >
              👥 Enrollments
            </button>
            <button 
              onClick={() => onEdit(course)}
              className="quantum-btn quantum-action-btn"
            >
              ✏️ Edit
            </button>
            <button 
              onClick={() => onDelete(course.id)}
              className="quantum-btn quantum-action-btn quantum-unenroll"
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(CourseCard);