import React from 'react';
import './EnrollmentsSection.css';
import CourseCard from './CourseCard';

const EnrollmentsSection = ({ 
  enrollments, 
  loading, 
  onUnenroll, 
  onRate, 
  user, 
  onStartTest,
  showMessage
}) => {
  // Calculate stats - handle missing data gracefully
  const totalEnrollments = enrollments.length;
  const completedCount = enrollments.filter(e => e?.completed).length;
  const inProgressCount = enrollments.filter(e => !e?.completed).length;
  const ratedCount = enrollments.filter(e => e?.rating).length;

  // Get enrollment ID from various possible properties
  const getEnrollmentId = (enrollment) => {
    return enrollment?.enrollmentId || enrollment?.id;
  };

  // Get course object from enrollment
  const getCourseFromEnrollment = (enrollment) => {
    if (enrollment.course) {
      return enrollment.course;
    }
    
    // If course is not nested, create a course object from enrollment properties
    return {
      id: enrollment.courseId,
      title: enrollment.courseTitle,
      category: enrollment.courseCategory,
      instructorName: enrollment.instructorName,
      // Add other course properties as needed
    };
  };

  // Enhanced unenroll handler with success message
  const handleUnenrollWithMessage = async (unenrollData) => {
    try {
      await onUnenroll(unenrollData);
      
      // Show success message
      if (showMessage) {
        showMessage('success', `✅ Successfully unenrolled from "${unenrollData.courseTitle}"! The course has been returned to available courses.`);
      }
    } catch (error) {
      console.error('Unenroll error:', error);
      // Error is already handled by the parent component
    }
  };

  if (!enrollments.length) {
    return (
      <div className="quantum-enrollments-section">
        <div className="section-header">
          <h2 className="quantum-text-gradient">🎓 My Enrollments (0)</h2>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No Enrollments Yet</h3>
          <p>You haven't enrolled in any courses yet. Browse available courses to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quantum-enrollments-section">
      <div className="section-header">
        {/* <h2 className="quantum-text-gradient">🎓 My Enrollments ({totalEnrollments})</h2> */}
        
        {/* Quick Stats Section */}
        <div className="enrollments-stats-grid">
          <div className="stat-card quantum-glass">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <div className="stat-number">{totalEnrollments}</div>
              <div className="stat-label">Total Enrolled</div>
            </div>
          </div>
          <div className="stat-card quantum-glass">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-number">{completedCount}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat-card quantum-glass">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-number">{inProgressCount}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
          <div className="stat-card quantum-glass">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-number">{ratedCount}</div>
              <div className="stat-label">Rated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="quantum-enrollments-grid">
        {enrollments.map((enrollment, index) => {
          if (!enrollment) {
            console.warn('❌ Invalid enrollment data:', enrollment);
            return null;
          }

          const enrollmentId = getEnrollmentId(enrollment);
          const course = getCourseFromEnrollment(enrollment);

          return (
            <CourseCard 
              key={enrollmentId || `enrollment-${index}-${course?.id}`}
              course={course}
              user={user}
              isEnrolled={true}
              onStartTest={onStartTest}
              onRate={onRate}
              onUnenroll={handleUnenrollWithMessage}
              enrollmentData={{
                ...enrollment,
                enrollmentId: enrollmentId,
                completed: enrollment.completed,
                enrollmentDate: enrollment.enrollmentDate
              }}
              loading={loading}
              showEnrollButton={false}
            />
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(EnrollmentsSection);