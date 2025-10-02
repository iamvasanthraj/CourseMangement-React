// components/enrollments/EnrollmentsSection.jsx
import React from 'react';
import './EnrollmentsSection.css';
import CourseCard from '../../dashboard/student/CourseCard';

const EnrollmentsSection = ({ 
  enrollments, 
  loading, 
  onUnenroll, 
  onRate, 
  onCompleteCourse, // ✅ ADD: Missing prop for completing courses
  user, 
  onStartTest,
  onViewCertificate,
  showMessage
}) => {
  const totalEnrollments = enrollments.length;
  const completedCount = enrollments.filter(e => e?.completed).length;
  const inProgressCount = enrollments.filter(e => !e?.completed).length;
  const ratedCount = enrollments.filter(e => e?.rating).length;

  const getEnrollmentId = (enrollment) => {
    return enrollment?.enrollmentId || enrollment?.id;
  };

  const getCourseFromEnrollment = (enrollment) => {
    if (enrollment.course) return enrollment.course;
    
    // ✅ FIX: Include ALL possible rating fields in course object
    return {
      id: enrollment.courseId,
      title: enrollment.courseTitle,
      category: enrollment.courseCategory,
      instructorName: enrollment.instructorName,
      price: enrollment.coursePrice || enrollment.price || 0,
      duration: enrollment.duration,
      level: enrollment.level,
      description: enrollment.courseDescription,
      // ✅ Include rating data in course object too
      averageRating: enrollment.courseAverageRating || enrollment.averageRating || enrollment.rating,
      totalRatings: enrollment.courseTotalRatings || enrollment.totalRatings,
      enrolledStudents: enrollment.enrolledStudents
    };
  };

  const handleUnenrollWithMessage = async (unenrollData) => {
    try {
      await onUnenroll(unenrollData);
      if (showMessage) {
        showMessage(
          'success',
          `✅ Successfully unenrolled from "${unenrollData.courseTitle}"!`
        );
      }
    } catch (error) {
      console.error('Unenroll error:', error);
    }
  };

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

  // ✅ ADD: Function to handle course completion with messaging
  const handleCompleteCourseWithMessage = async (completionData) => {
    try {
      if (!onCompleteCourse) {
        console.error('❌ onCompleteCourse function not provided');
        return;
      }

      console.log('🎯 Marking course as completed:', completionData);
      
      await onCompleteCourse(completionData);
      
      if (showMessage) {
        showMessage(
          'success', 
          `🎉 Course completed successfully! Certificate is now available.`
        );
      }
    } catch (error) {
      console.error('❌ Course completion error:', error);
      if (showMessage) {
        showMessage('error', 'Failed to update course completion status');
      }
    }
  };

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
        </div>
      </div>

      <div className="quantum-enrollments-grid">
        {enrollments.map((enrollment, index) => {
          if (!enrollment) {
            console.warn('❌ Invalid enrollment data:', enrollment);
            return null;
          }

          const enrollmentId = getEnrollmentId(enrollment);
          const course = getCourseFromEnrollment(enrollment);

          // ✅ DEBUG: Log what data is being passed to CourseCard
          console.log('🔍 Passing to CourseCard:', {
            courseTitle: course.title,
            courseRating: course.averageRating,
            enrollmentRating: enrollment.courseAverageRating,
            hasRating: enrollment.courseAverageRating > 0 || course.averageRating > 0,
            enrollmentId: enrollmentId,
            completed: enrollment.completed
          });

          return (
            <CourseCard 
              key={enrollmentId || `enrollment-${index}-${course?.id}`}
              course={course}
              user={user}
              isEnrolled={true}
              onStartTest={onStartTest}
              onRate={handleRateWithMessage}  
              onUnenroll={handleUnenrollWithMessage}
              onCompleteCourse={handleCompleteCourseWithMessage} // ✅ ADD: This was missing!
              onViewCertificate={handleViewCertificateWithMessage}
              enrollmentData={{
                ...enrollment,
                enrollmentId: enrollmentId,
                completed: enrollment.completed,
                enrollmentDate: enrollment.enrollmentDate,
                completionDate: enrollment.completionDate,
                // ✅ FIX: Ensure rating fields are properly passed
                courseAverageRating: enrollment.courseAverageRating || enrollment.averageRating || enrollment.rating || 0,
                courseTotalRatings: enrollment.courseTotalRatings || enrollment.totalRatings || 0,
                enrolledStudents: enrollment.enrolledStudents || 0,
                instructorName: enrollment.instructorName,
                duration: enrollment.duration,
                level: enrollment.level,
                batch: enrollment.batch,
                testScore: enrollment.testScore,
                totalQuestions: enrollment.totalQuestions,
                percentage: enrollment.percentage
              }}
              loading={loading}
              showEnrollButton={false}
              showPrice={false}
            />
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(EnrollmentsSection);