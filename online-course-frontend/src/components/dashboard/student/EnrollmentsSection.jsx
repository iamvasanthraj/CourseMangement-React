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
  onViewCertificate, // ✅ ADD: Certificate handler
  showMessage
}) => {
  // Stats
  const totalEnrollments = enrollments.length;
  const completedCount = enrollments.filter(e => e?.completed).length;
  const inProgressCount = enrollments.filter(e => !e?.completed).length;
  const ratedCount = enrollments.filter(e => e?.rating).length;

  // Helpers
  const getEnrollmentId = (enrollment) => {
    return enrollment?.enrollmentId || enrollment?.id;
  };

  const getCourseFromEnrollment = (enrollment) => {
    if (enrollment.course) return enrollment.course;
    return {
      id: enrollment.courseId,
      title: enrollment.courseTitle,
      category: enrollment.courseCategory,
      instructorName: enrollment.instructorName,
    };
  };

  // Enhanced Unenroll handler
  const handleUnenrollWithMessage = async (unenrollData) => {
    try {
      await onUnenroll(unenrollData);
      if (showMessage) {
        showMessage(
          'success',
          `✅ Successfully unenrolled from "${unenrollData.courseTitle}"! The course has been returned to available courses.`
        );
      }
    } catch (error) {
      console.error('Unenroll error:', error);
    }
  };

  // Enhanced Rate handler
  const handleRateWithMessage = async (courseId, rating, ratingData) => {
    try {
      await onRate(courseId, rating, ratingData);
      if (showMessage) {
        showMessage('success', '⭐ Rating submitted successfully!');
      }
    } catch (error) {
      console.error('Rating error:', error);
      if (showMessage) {
        showMessage('error', 'Failed to submit rating');
      }
    }
  };

  // ✅ ADD: Certificate handler
  const handleViewCertificateWithMessage = async (enrollmentId) => {
    try {
      const certificate = onViewCertificate(enrollmentId);
      if (certificate) {
        showMessage('success', '🎓 Opening certificate...');
      }
    } catch (error) {
      console.error('Certificate error:', error);
      if (showMessage) {
        showMessage('error', 'Failed to open certificate');
      }
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
  <div className="stat-icon">🏆</div>
  <div className="stat-content">
    <div className="stat-number">{completedCount}</div>
    <div className="stat-label">Certificates Earned</div>
  </div>
</div>
          {/* <div className="stat-card quantum-glass">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-number">{ratedCount}</div>
              <div className="stat-label">Rated</div>
            </div>
          </div> */}
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
              onRate={handleRateWithMessage}  
              onUnenroll={handleUnenrollWithMessage}
              onViewCertificate={handleViewCertificateWithMessage} // ✅ PASS: Certificate handler
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