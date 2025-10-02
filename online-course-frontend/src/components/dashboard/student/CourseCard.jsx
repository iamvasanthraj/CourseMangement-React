import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseCard.css';
import RatingModal from '../../shared/RatingModal';
import TestModal from '../../test/TestModal';
import { testResultsAPI } from '../../../services/api';
import UnenrollConfirmationModal from '../../dashboard/student/UnenrollConfirmationModal';
import Certificate from '../../shared/Certificate';
import { getRandomQuestions } from '../../../utils/questionUtils';
import { useDashboard } from '../../../hooks/useDashboard';
import ModalPortal from '../../shared/ModalPortal';

const CourseCard = ({ 
  course, 
  user, 
  isEnrolled, 
  onEnroll, 
  onRate,
  onUnenroll,
  onCompleteCourse, // ✅ ADD: New prop for completing course
  loading, 
  showEnrollButton = true,
  enrollmentData
}) => {
  const [activeModal, setActiveModal] = useState(null);
  const [isUnenrolling, setIsUnenrolling] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [loadingTestResult, setLoadingTestResult] = useState(false);
  const navigate = useNavigate();

  const { handleTestCompletion, refreshEnrollments, showMessage } = useDashboard();

  // Ensure component is mounted before showing modals
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // ✅ UPDATED: Fetch test result AND check completion status
  useEffect(() => {
    if (isEnrolled && enrollmentData?.enrollmentId) {
      fetchTestResultFromMySQL();
      checkAndUpdateCompletionStatus();
    }
  }, [isEnrolled, enrollmentData?.enrollmentId]);

  // ✅ ADD: Function to check if course should be marked as completed
  const checkAndUpdateCompletionStatus = async () => {
    if (!enrollmentData?.enrollmentId || enrollmentData.completed) return;
    
    try {
      console.log('🔍 Checking if course should be marked as completed...');
      const response = await testResultsAPI.getTestResultByEnrollment(enrollmentData.enrollmentId);
      
      if (response.success && response.testResult) {
        const testData = response.testResult;
        console.log('📊 Test result for completion check:', testData);
        
        // ✅ Check if test was passed but course not marked completed
        if (testData.passed && !enrollmentData.completed) {
          console.log('🎯 Test passed but course not completed - marking as complete');
          await markCourseAsCompleted();
        }
      }
    } catch (error) {
      console.error('❌ Error checking completion status:', error);
    }
  };

  // ✅ ADD: Function to mark course as completed
  const markCourseAsCompleted = async () => {
    if (!onCompleteCourse || !enrollmentData?.enrollmentId) {
      console.error('🛑 Missing onCompleteCourse function or enrollmentId');
      return;
    }

    try {
      console.log('✅ Marking course as completed:', {
        enrollmentId: enrollmentData.enrollmentId,
        courseId: course.id,
        courseTitle: course.title
      });

      await onCompleteCourse({
        enrollmentId: enrollmentData.enrollmentId,
        courseId: course.id,
        completionDate: new Date().toISOString()
      });

      // Refresh enrollments to get updated data
      if (refreshEnrollments) {
        await refreshEnrollments();
      }

      showMessage('🎉 Course completed successfully! Certificate is now available.', 'success');
      
    } catch (error) {
      console.error('🛑 Failed to mark course as completed:', error);
      showMessage('Failed to update course completion status.', 'error');
    }
  };

  // ✅ ADD: Function to handle test completion (call this when test is submitted)
  const handleTestSubmitted = async (testData) => {
    try {
      console.log('📝 Test submitted, checking results...', testData);
      
      // Wait a moment for the result to be saved to MySQL
      setTimeout(async () => {
        await fetchTestResultFromMySQL();
        await checkAndUpdateCompletionStatus();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error handling test submission:', error);
    }
  };

  // ✅ UPDATED: Fetch test result from MySQL
  const fetchTestResultFromMySQL = async () => {
    if (!enrollmentData?.enrollmentId) return;
    
    try {
      setLoadingTestResult(true);
      console.log('📊 Fetching test result from MySQL for enrollment:', enrollmentData.enrollmentId);
      
      const response = await testResultsAPI.getTestResultByEnrollment(enrollmentData.enrollmentId);
      
      if (response.success && response.testResult) {
        console.log('✅ MySQL test result:', response.testResult);
        setTestResult(response.testResult);
        
        // ✅ AUTO-COMPLETION: If test passed but course not completed, mark it
        if (response.testResult.passed && !enrollmentData.completed) {
          console.log('🏆 Auto-completing course after passed test');
          await markCourseAsCompleted();
        }
      } else {
        console.log('📝 No test result found in MySQL');
        setTestResult(null);
      }
    } catch (error) {
      console.error('❌ Error fetching test result from MySQL:', error);
      setTestResult(null);
    } finally {
      setLoadingTestResult(false);
    }
  };

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
  const getRatingData = () => {
    const courseRating = parseFloat(course?.averageRating);
    const courseTotal = parseInt(course?.totalRatings) || 0;

    if (!isNaN(courseRating) && courseRating > 0) {
      return {
        averageRating: courseRating,
        totalRatings: courseTotal,
        enrolledStudents: parseInt(course?.enrolledStudents) || 0
      };
    }

    return {
      averageRating: 0.0,
      totalRatings: 0,
      enrolledStudents: parseInt(course?.enrolledStudents) || 0
    };
  };

  const ratingData = getRatingData();
  const averageRating = ratingData.averageRating;
  const totalRatings = ratingData.totalRatings;
  const enrolledStudents = ratingData.enrolledStudents;

  const instructorName = enrollmentData?.instructorName || course?.instructorName || 
                        (user?.role === 'INSTRUCTOR' ? user.username : 'Course Instructor');
  
  const courseDuration = enrollmentData?.duration || course?.duration || '8 weeks';
  const courseLevel = enrollmentData?.level || course?.level || 'Beginner';
  const courseBatch = enrollmentData?.batch || course?.batch || 'Current Batch';
  
  const courseDescription = course?.description || enrollmentData?.courseDescription || 
                           `Master ${course?.title || enrollmentData?.courseTitle} through hands-on projects and expert guidance.`;

  const enrollmentId = React.useMemo(() => {
    return enrollmentData?.enrollmentId || enrollmentData?.id || enrollmentData?._id;
  }, [enrollmentData]);

  // ✅ UPDATED: Get test score information with MySQL priority
  const getTestScoreInfo = () => {
    // 1. First try MySQL test results (most reliable)
    if (testResult) {
      console.log('📊 Using MySQL test result:', testResult);
      return {
        score: testResult.testScore,
        total: testResult.totalQuestions,
        percentage: testResult.percentage,
        passed: testResult.passed,
        fromDatabase: true
      };
    }
    
    // 2. Then try enrollment data (fallback)
    if (enrollmentData?.testScore !== undefined && enrollmentData.testScore > 0) {
      const total = enrollmentData.totalQuestions || 10;
      const percentage = enrollmentData.percentage || (enrollmentData.testScore / total) * 100;
      const passed = enrollmentData.testScore >= (total * 0.6); // 60% passing
      
      return {
        score: enrollmentData.testScore,
        total: total,
        percentage: percentage,
        passed: passed
      };
    }
    
    // 3. Default for incomplete courses
    return {
      score: 0,
      total: 10,
      percentage: 0,
      passed: false
    };
  };

  // ✅ UPDATED: Certificate eligibility using MySQL data
  const isEligibleForCertificate = () => {
    const isCompleted = enrollmentData?.completed;
    const scoreInfo = getTestScoreInfo();
    
    console.log('🏆 CERTIFICATE ELIGIBILITY CHECK:', {
      courseTitle: course?.title,
      isCompleted,
      testScore: scoreInfo.score,
      passed: scoreInfo.passed,
      fromMySQL: !!testResult,
      eligible: isCompleted && scoreInfo.passed
    });
    
    return isCompleted && scoreInfo.passed;
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

// In CourseCard.jsx - FIXED handleConfirmTest
const handleConfirmTest = async () => {
  console.log('🚀 Starting test...');
  
  try {
    const randomQuestions = getRandomQuestions(10);
    console.log('📋 Questions generated:', randomQuestions?.length);
    
    // ✅ FIXED: Remove any functions from the state
    const testData = {
      courseId: course.id,
      courseTitle: course.title,
      studentId: user.userId,
      enrollmentId: enrollmentId,
      questions: randomQuestions,
      totalQuestions: randomQuestions.length,
      duration: 5 * 60,
    };

    setActiveModal(null);
    navigate('/test', { state: testData });
    
  } catch (error) {
    console.error('❌ Failed to start test:', error);
    alert('Failed to start test. Please try again.');
  }
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

      await onUnenroll({
        courseId: course.id,
        userId: user.userId,
        enrollmentId: enrollmentId,
        courseTitle: course.title
      });

      console.log('✅ Unenroll request sent successfully');
      
    } catch (error) {
      console.error('🛑 Unenroll failed:', error);
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
  const hasTestScore = scoreInfo.score > 0;

  return (
    <>
      {/* MODALS USING PORTALS */}
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

      {/* Course Card */}
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
              {hasTestScore && (
                <div className="enrollment-stat">
                  <span className="stat-icon">
                    {scoreInfo.passed ? '🎯' : '📝'}
                  </span>
                  <div className="stat-info">
                    <div className="stat-value">
                      Test Score {testResult && '✅'}
                    </div>
                    <div className={`stat-date ${scoreInfo.passed ? 'passed' : 'failed'}`}>
                      {scoreInfo.score}/{scoreInfo.total} ({scoreInfo.percentage}%)
                      {scoreInfo.passed ? ' - Passed! 🎉' : ' - Try Again'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
              {/* ✅ UPDATED: Show certificate button when test is passed */}
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
              
              {/* ✅ UPDATED: After completion - Show certificate button if passed */}
              {enrollmentData?.completed && (
                <div className="enrolled-actions after-test">
                  <div className="after-test-row">
                    <button 
                      onClick={handleStartTestClick} 
                      className="action-btn test-btn"
                      title={`Retake test (Previous: ${scoreInfo.score}/${scoreInfo.total})`}
                    >
                      🔄 Retake Test
                    </button>
                    
                    {/* ✅ CERTIFICATE BUTTON - Only show if test passed */}
                    {scoreInfo.passed && (
                      <button 
                        onClick={handleCertificateClick} 
                        className="action-btn certificate-btn"
                        title={`View your certificate! Score: ${scoreInfo.score}/${scoreInfo.total} (${scoreInfo.percentage}%)`}
                      >
                        🎓 View Certificate
                      </button>
                    )}
                    
                    <button 
                      onClick={handleRateClick} 
                      className="action-btn rate-btn"
                      title="Rate this course"
                    >
                      <StarIcon /> Rate Course
                    </button>
                  </div>
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