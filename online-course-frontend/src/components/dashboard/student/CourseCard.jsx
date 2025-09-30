import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseCard.css';
import RatingModal from '../../shared/RatingModal';
import TestModal from '../../test/TestModal';
import { getRandomQuestions } from '../../../utils/questionUtils';

const CourseCard = ({ 
  course, 
  user, 
  isEnrolled, 
  onEnroll, 
  onRate,
  onUnenroll,
  loading, 
  showEnrollButton = true,
  enrollmentData
}) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [isUnenrolling, setIsUnenrolling] = useState(false);
  const navigate = useNavigate();

  const averageRating = course?.rating || 0;
  const totalRatings = course?.totalRatings || 0;
  const enrolledStudents = course?.enrolledStudents || 0;

  // Get the enrollment ID from various possible properties
  const getEnrollmentId = () => {
    return enrollmentData?.enrollmentId || enrollmentData?.id || enrollmentData?._id;
  };

  const enrollmentId = getEnrollmentId();

  const handleEnrollClick = async () => {
    if (course?.id && !loading) {
      await onEnroll(course.id);
    }
  };

  const handleRateClick = () => {
    setShowRatingModal(true);
  };

  const handleStartTestClick = () => {
    console.log('🎯 Take Test button clicked');
    setShowTestModal(true);
  };

  const handleConfirmTest = () => {
    console.log('🚀 Starting test with random questions...');
    
    if (!course?.id) {
      console.error('❌ Missing course ID');
      alert('Course information missing');
      return;
    }

    if (!user?.userId) {
      console.error('❌ Missing user ID');
      alert('User information missing');
      return;
    }

    // Close modal first
    setShowTestModal(false);

    // Generate a unique session ID for this test attempt
    const testSessionId = `test_${course.id}_${user.userId}_${Date.now()}`;
    
    // Get 10 random questions
    const randomQuestions = getRandomQuestions(10);
    
    // Prepare test data using available information
    const testData = {
      // Required identifiers
      courseId: course.id,
      courseTitle: course.title,
      studentId: user.userId,
      studentName: user.name || user.email,
      
      // Use available enrollment data or create temporary session
      enrollmentId: enrollmentId || testSessionId,
      isTemporarySession: !enrollmentId,
      
      // Random test questions
      questions: randomQuestions,
      totalQuestions: randomQuestions.length,
      duration: 5 * 60, // 5 minutes
      
      // Additional context for the test
      courseCategory: course.category,
      courseLevel: course.level,
      instructorName: course.instructorName
    };

    console.log('📤 Navigating to test page with random questions:', randomQuestions.length);

    // Navigate to test page
    navigate('/test', { state: testData });
  };

  const handleUnenrollClick = async () => {
    if (!onUnenroll) {
      console.error('❌ Unenroll function not provided');
      alert('Unenroll functionality not available.');
      return;
    }

    if (!course?.id) {
      console.error('❌ Missing course ID');
      alert('Course information missing.');
      return;
    }

    if (!user?.userId) {
      console.error('❌ Missing user ID');
      alert('User information missing.');
      return;
    }

    // Confirm unenrollment
    const confirmUnenroll = window.confirm(
      `Are you sure you want to unenroll from "${course.title}"? You will lose all progress.`
    );

    if (!confirmUnenroll) {
      return;
    }

    setIsUnenrolling(true);

    try {
      console.log('🗑️ Attempting to unenroll from course:', {
        courseId: course.id,
        courseTitle: course.title,
        userId: user.userId,
        enrollmentId: enrollmentId
      });

      // Call unenroll with available information
      await onUnenroll({
        courseId: course.id,
        userId: user.userId,
        enrollmentId: enrollmentId, // Pass if available, but not required
        courseTitle: course.title
      });

      console.log('✅ Unenroll request sent successfully');
      
    } catch (error) {
      console.error('❌ Unenroll failed:', error);
      // Error is handled by the parent component
    } finally {
      setIsUnenrolling(false);
    }
  };

  const handleCertificateClick = () => {
    console.log('Download certificate for course:', course.id);
    // Add certificate download logic here
  };

  const handleRatingUpdated = () => {
    setShowRatingModal(false);
    if (onRate) {
      onRate();
    }
  };

  const StarIcon = () => (
    <svg className="star-svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );

  if (!course) return null;

  return (
    <div className="course-card quantum-glass">
      <div className="card-header">
        <div className="course-badge">{course.category}</div>
        <div className="course-price">${course.price || 0}</div>
      </div>

      <div className="card-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>

        <div className="course-meta">
          <div className="meta-item"><span className="meta-icon">👨‍🏫</span>{course.instructorName}</div>
          <div className="meta-item"><span className="meta-icon">👥</span>{enrolledStudents} students</div>
          {course.batch && <div className="meta-item"><span className="meta-icon">📅</span>{course.batch}</div>}
        </div>

        {isEnrolled && enrollmentData && (
          <div className="enrollment-quick-stats">
            <div className="enrollment-stat">
              <span className="stat-icon">📅</span>
              <div className="stat-info">
                <div className="stat-value">Enrolled</div>
                <div className="stat-date">
                  {enrollmentData.enrollmentDate ? 
                    new Date(enrollmentData.enrollmentDate).toLocaleDateString() : 
                    'Recently enrolled'
                  }
                </div>
              </div>
            </div>
            <div className="enrollment-stat">
              <span className="stat-icon">
                {enrollmentData.completed ? '✅' : '⏳'}
              </span>
              <div className="stat-info">
                <div className="stat-value">
                  {enrollmentData.completed ? 'Completed' : 'In Progress'}
                </div>
                {enrollmentData.completed && enrollmentData.completionDate && (
                  <div className="stat-date">
                    {new Date(enrollmentData.completionDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="course-stats">
          <div className="stat">
            <span className="stat-value">{averageRating.toFixed(1)} ({totalRatings})</span>
            <span className="stat-label">Rating</span>
          </div>
          <div className="stat">
            <span className="stat-value">{course.duration || '8 weeks'}</span>
            <span className="stat-label">Duration</span>
          </div>
          <div className="stat">
            <span className="stat-value">{course.level || 'Beginner'}</span>
            <span className="stat-label">Level</span>
          </div>
        </div>
      </div>
      
      <div className="card-actions">
        {showEnrollButton && !isEnrolled && (
          <button 
            onClick={handleEnrollClick} 
            className="action-btn enroll-btn" 
            disabled={loading}
          >
            {loading ? 'Enrolling...' : <>🎯 Enroll Now</>}
          </button>
        )}

        {isEnrolled && (
          <div className="enrolled-actions">
            {!enrollmentData?.completed && (
              <button 
                onClick={handleStartTestClick} 
                className="action-btn test-btn"
              >
                🧪 Take Test 
              </button>
            )}
            
            {enrollmentData?.completed && (
              <button 
                onClick={handleCertificateClick} 
                className="action-btn certificate-btn"
              >
                🎓 Certificate
              </button>
            )}
            
            <button 
              onClick={handleRateClick} 
              className="action-btn rate-btn"
            >
              <StarIcon /> Rate Course
            </button>

            {/* Unenroll button - always visible for enrolled users */}
            <button 
              onClick={handleUnenrollClick} 
              className="action-btn unenroll-btn"
              disabled={isUnenrolling || !onUnenroll}
              title="Unenroll from this course"
            >
              {isUnenrolling ? '⏳ Unenrolling...' : '❌ Unenroll'}
            </button>
          </div>
        )}
      </div>

      {showRatingModal && (
        <RatingModal
          course={course}
          studentId={user?.userId}
          onClose={() => setShowRatingModal(false)}
          onRatingUpdated={handleRatingUpdated}
        />
      )}

      {showTestModal && (
        <TestModal
          questions={getRandomQuestions(10)}
          onConfirm={handleConfirmTest}
          onClose={() => setShowTestModal(false)}
        />
      )}
    </div>
  );
};

export default CourseCard;