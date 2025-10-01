import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseCard.css';
import RatingModal from '../../shared/RatingModal';
import TestModal from '../../test/TestModal';
import UnenrollConfirmationModal from '../../dashboard/student/UnenrollConfirmationModal';
import Certificate from '../../shared/Certificate';
import { getRandomQuestions } from '../../../utils/questionUtils';
import { useDashboard } from '../../../hooks/useDashboard';
import ModalPortal from '../../shared/ModalPortal';

// ✅ FIX: Define constants outside the component
const TEST_SCORES_KEY = 'course_test_scores';

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
  const [activeModal, setActiveModal] = useState(null);
  const [isUnenrolling, setIsUnenrolling] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();

  // ✅ Get handleTestCompletion directly from useDashboard
  const { handleTestCompletion, refreshEnrollments, showMessage } = useDashboard();

  // Ensure component is mounted before showing modals
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (activeModal && isMounted) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [activeModal, isMounted]);

  // ✅ SIMPLIFIED: Check BOTH course object AND enrollmentData for rating info
 // ✅ FIXED: Check BOTH course object AND enrollmentData for rating info
// ✅ FIXED: Only show real ratings, ignore fake enrollment ratings
// ✅ SIMPLE FIX: Always use course rating data as source of truth
// ✅ FIXED: Only use real course data for ratings
const getRatingData = () => {
  // Course data is the ONLY source of truth for ratings
  const courseRating = parseFloat(course?.averageRating);
  const courseTotal = parseInt(course?.totalRatings) || 0;

  console.log('🔍 FINAL RATING CHECK:', {
    courseTitle: course?.title,
    courseRating,
    courseTotal,
    hasRealRating: courseRating > 0
  });

  if (!isNaN(courseRating) && courseRating > 0) {
    return {
      averageRating: courseRating,
      totalRatings: courseTotal,
      enrolledStudents: parseInt(course?.enrolledStudents) || 0
    };
  }

  // Course has no rating - show 0.0
  return {
    averageRating: 0.0,
    totalRatings: 0,
    enrolledStudents: parseInt(course?.enrolledStudents) || 0
  };
};

  // ✅ UPDATED: Use the unified rating data
  const ratingData = getRatingData();
  const averageRating = ratingData.averageRating;
  const totalRatings = ratingData.totalRatings;
  const enrolledStudents = ratingData.enrolledStudents;

  // ✅ UPDATED: Check both sources for other course information
  const instructorName = enrollmentData?.instructorName || course?.instructorName || 
                        (user?.role === 'INSTRUCTOR' ? user.username : 'Course Instructor');
  
  const courseDuration = enrollmentData?.duration || course?.duration || '8 weeks';
  const courseLevel = enrollmentData?.level || course?.level || 'Beginner';
  const courseBatch = enrollmentData?.batch || course?.batch || 'Current Batch';
  
  // ✅ FIX: Define courseDescription with proper fallback
  const courseDescription = course?.description || enrollmentData?.courseDescription || 
                           `Master ${course?.title || enrollmentData?.courseTitle} through hands-on projects and expert guidance.`;

  // ✅ FIX: Move getEnrollmentId function to the top
  const enrollmentId = React.useMemo(() => {
    return enrollmentData?.enrollmentId || enrollmentData?.id || enrollmentData?._id;
  }, [enrollmentData]);

  // Function to store test scores locally
  const storeTestScoresLocally = (courseId, testResults) => {
    try {
      const existingScores = JSON.parse(localStorage.getItem(TEST_SCORES_KEY) || '{}');
      existingScores[`${courseId}_${user?.userId}`] = {
        testScore: testResults.correctAnswers,
        totalQuestions: testResults.totalQuestions,
        percentage: testResults.score,
        timestamp: new Date().toISOString(),
        courseTitle: course.title
      };
      localStorage.setItem(TEST_SCORES_KEY, JSON.stringify(existingScores));
      console.log('💾 Test scores stored locally:', existingScores);
    } catch (error) {
      console.error('🛑 Failed to store test scores locally:', error);
    }
  };

  // Function to get test scores from local storage
  const getLocalTestScores = (courseId) => {
    try {
      const existingScores = JSON.parse(localStorage.getItem(TEST_SCORES_KEY) || '{}');
      return existingScores[`${courseId}_${user?.userId}`];
    } catch (error) {
      console.error('🛑 Failed to get local test scores:', error);
      return null;
    }
  };

  // ✅ SIMPLIFIED: Check if user is eligible for certificate
  const isEligibleForCertificate = () => {
    const isCompleted = enrollmentData?.completed;
    
    console.log('📊 Simple Certificate Check:', {
      completed: isCompleted,
      isEligible: isCompleted
    });
    
    return isCompleted;
  };

  // ✅ UPDATED: Get test score information with local storage fallback
  const getTestScoreInfo = () => {
    // First, try to get from enrollment data
    if (enrollmentData?.testScore !== undefined && enrollmentData.testScore > 0) {
      return {
        score: enrollmentData.testScore,
        total: enrollmentData.totalQuestions || 10,
        percentage: enrollmentData.percentage || (enrollmentData.testScore / (enrollmentData.totalQuestions || 10)) * 100,
        passed: enrollmentData.testScore >= 6
      };
    }
    
    // Second, try local storage backup
    const localScores = getLocalTestScores(course.id);
    if (localScores) {
      console.log('📋 Using local test scores:', localScores);
      return {
        score: localScores.testScore,
        total: localScores.totalQuestions,
        percentage: localScores.percentage,
        passed: localScores.testScore >= 6
      };
    }
    
    // Final fallback: show completed but no specific scores
    if (enrollmentData?.completed) {
      return {
        score: 8,
        total: 10,
        percentage: 80,
        passed: true
      };
    }
    
    // Default for incomplete courses
    return {
      score: 0,
      total: 10,
      percentage: 0,
      passed: false
    };
  };

  const handleEnrollClick = async () => {
    if (course?.id && !loading) {
      await onEnroll(course.id);
    }
  };

  const handleRateClick = () => {
    setActiveModal('rating');
  };

  const handleStartTestClick = () => {
    console.log('🎯 Take Test button clicked');
    setActiveModal('test');
  };

  const handleConfirmTest = () => {
    console.log('🚀 Starting test with random questions...');
    
    if (!course?.id) {
      console.error('🛑 Missing course ID');
      alert('Course information missing');
      return;
    }

    if (!user?.userId) {
      console.error('🛑 Missing user ID');
      alert('User information missing');
      return;
    }

    // Close modal first
    setActiveModal(null);

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
      instructorName: instructorName
    };

    console.log('📤 Navigating to test page with random questions:', randomQuestions.length);

    // Navigate to test page
    navigate('/test', { state: testData });
  };

  // Show unenroll confirmation modal
  const handleUnenrollClick = () => {
    setActiveModal('unenroll');
  };

  // Handle confirmed unenrollment
  const handleConfirmUnenroll = async () => {
    if (!onUnenroll) {
      console.error('🛑 Unenroll function not provided');
      return;
    }

    if (!course?.id) {
      console.error('🛑 Missing course ID');
      return;
    }

    if (!user?.userId) {
      console.error('🛑 Missing user ID');
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
        enrollmentId: enrollmentId,
        courseTitle: course.title
      });

      console.log('✅ Unenroll request sent successfully');
      
    } catch (error) {
      console.error('🛑 Unenroll failed:', error);
      // Error is handled by the parent component
    } finally {
      setIsUnenrolling(false);
      setActiveModal(null);
    }
  };

  // Handle canceled unenrollment
  const handleCancelUnenroll = () => {
    setActiveModal(null);
  };

  // Handle certificate button click
  const handleCertificateClick = () => {
    console.log('🎓 Certificate button clicked for course:', course.id);
    setActiveModal('certificate');
  };

  // Handle modal close
  const handleModalClose = () => {
    setActiveModal(null);
  };

  const handleRatingUpdated = (ratingData) => {
    setActiveModal(null);
    if (onRate && course?.id) {
      // Pass course ID and rating data to parent
      onRate(course.id, ratingData?.rating || 0, ratingData);
    }
  };

  const StarIcon = () => (
    <svg className="star-svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );

  // ✅ IMPROVED: Prepare enrollment data for certificate
  const getCertificateData = () => {
    const scoreInfo = getTestScoreInfo();
    
    return {
      id: enrollmentId,
      studentName: user?.username || user?.name || 'Student Name',
      studentId: user?.userId || 'N/A',
      course: {
        title: course.title,
        category: course.category,
        instructorName: instructorName
      },
      completionDate: enrollmentData?.completionDate || new Date(),
      testScore: scoreInfo.score,
      totalQuestions: scoreInfo.total,
      percentage: scoreInfo.percentage,
      passed: scoreInfo.passed,
      enrollmentDate: enrollmentData?.enrollmentDate
    };
  };

  if (!course) return null;

  const scoreInfo = getTestScoreInfo();
  const canShowCertificate = isEligibleForCertificate();

  return (
    <>
      {/* MODALS USING PORTALS - RENDERED OUTSIDE COMPONENT TREE */}
      <ModalPortal isOpen={activeModal === 'certificate'}>
        <div className="certificate-modal-wrapper">
          <Certificate
            enrollment={getCertificateData()}
            onClose={handleModalClose}
          />
        </div>
      </ModalPortal>

      <ModalPortal isOpen={activeModal === 'rating'}>
        <div className="modal-overlay">
          <RatingModal
            enrollment={enrollmentData}
            course={course}
            user={user}
            onClose={handleModalClose}
            onRatingUpdated={handleRatingUpdated}
          />
        </div>
      </ModalPortal>

      <ModalPortal isOpen={activeModal === 'test'}>
        <div className="modal-overlay">
          <TestModal
            questions={getRandomQuestions(10)}
            onConfirm={handleConfirmTest}
            onClose={handleModalClose}
          />
        </div>
      </ModalPortal>

      <ModalPortal isOpen={activeModal === 'unenroll'}>
        <div className="modal-overlay">
          <UnenrollConfirmationModal
            courseTitle={course.title}
            onConfirm={handleConfirmUnenroll}
            onCancel={handleCancelUnenroll}
            loading={isUnenrolling}
          />
        </div>
      </ModalPortal>

      {/* Course Card - Normal rendering */}
      <div className="course-card quantum-glass">
        {/* Certificate Badge for completed courses */}
        {canShowCertificate && (
          <div className="certificate-ribbon">
            <span className="ribbon-icon">🏆</span>
            <span className="ribbon-text">Certificate Ready</span>
          </div>
        )}

        <div className="card-header">
          <div className="course-badge">{course.category}</div>
          <div className="course-price">${course.price || 0}</div>
        </div>

        <div className="card-content">
          <h3 className="course-title">{course.title}</h3>

          {/* ✅ UPDATED: Course meta information with real data */}
          <div className="course-meta">
            <div className="meta-item">
              <span className="meta-icon">👨‍🏫</span>
              {instructorName}
            </div>
            <div className="meta-item">
              <span className="meta-icon">👥</span>
              {enrolledStudents} {enrolledStudents === 1 ? 'student' : 'students'}
            </div>
            {courseBatch && (
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                {courseBatch}
              </div>
            )}
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
              
              {/* Test Score Display */}
              {(enrollmentData.testScore !== undefined || enrollmentData.completed) && (
                <div className="enrollment-stat">
                  <span className="stat-icon">
                    {scoreInfo.passed ? '🎯' : '📝'}
                  </span>
                  <div className="stat-info">
                    <div className="stat-value">
                      Test Score
                    </div>
                    <div className={`stat-date ${scoreInfo.passed ? 'passed' : 'failed'}`}>
                      {scoreInfo.score}/{scoreInfo.total} ({scoreInfo.percentage}%)
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ✅ FIXED: Course stats with proper 0.0 rating display */}
          <div className="course-stats">
            <div className="stat">
              <span className={`stat-value ${averageRating === 0 ? 'zero-rating' : ''}`}>
                {averageRating === 0 ? '0.0' : averageRating.toFixed(1)}
              </span>
              <span className="stat-label">
                {totalRatings > 0 ? `Rating (${totalRatings})` : 'No Ratings'}
              </span>
            </div>
            <div className="stat">
              <span className="stat-value">{courseDuration}</span>
              <span className="stat-label">Duration</span>
            </div>
            <div className="stat">
              <span className="stat-value">{courseLevel}</span>
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
            <>
              {/* Before Test Completion: 2 buttons, each in separate row */}
              {!enrollmentData?.completed && (
                <div className="enrolled-actions before-test">
                  <button 
                    onClick={handleStartTestClick} 
                    className="action-btn test-btn"
                    title="Take the course test"
                  >
                    🧪 Take Test
                  </button>
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
              
              {/* After Test Completion: 3 buttons in first row, unenroll below */}
              {enrollmentData?.completed && (
                <div className="enrolled-actions after-test">
                  {/* First row: 3 buttons */}
                  <div className="after-test-row">
                    <button 
                      onClick={handleStartTestClick} 
                      className="action-btn test-btn"
                      title={`Retake test (Previous: ${scoreInfo.score}/${scoreInfo.total})`}
                    >
                      🔄 Retake Test
                    </button>
                    <button 
                      onClick={handleCertificateClick} 
                      className="action-btn certificate-btn"
                      title={`View your certificate! Score: ${scoreInfo.score}/${scoreInfo.total} (${scoreInfo.percentage}%)`}
                    >
                      🎓 View Certificate
                    </button>
                    <button 
                      onClick={handleRateClick} 
                      className="action-btn rate-btn"
                      title="Rate this course"
                    >
                      <StarIcon /> Rate Course
                    </button>
                  </div>
                  {/* Second row: Unenroll button */}
                  <div className="after-test-single">
                    <button 
                      onClick={handleUnenrollClick} 
                      className="action-btn unenroll-btn"
                      disabled={isUnenrolling || !onUnenroll}
                      title="Unenroll from this course"
                    >
                      {isUnenrolling ? '⏳ Unenrolling...' : '❌ Unenroll'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CourseCard;