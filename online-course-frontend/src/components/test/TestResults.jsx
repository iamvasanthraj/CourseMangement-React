// components/test/TestResults.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import './TestResults.css';

const TestResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state;
  const [showConfetti, setShowConfetti] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // ✅ ADD: useRef to track if processing has already been done
  const hasProcessed = useRef(false);
  
  // Use the dashboard hook
  const { handleTestCompletion, user, enrollments, showMessage } = useDashboard();

  useEffect(() => {
    console.log('📊 TestResults mounted with results:', results);
    
    if (!results) {
      console.warn('❌ No results found, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }

    // ✅ FIX: Only process results once using useRef
    if (hasProcessed.current) {
      console.log('⏩ Already processed results, skipping...');
      return;
    }

    // Show confetti if passed
    if (results.passed && !results.isTemporary) {
      setShowConfetti(true);
      
      // Process test completion and generate certificate data
      const processResults = async () => {
        try {
          setIsProcessing(true);
          console.log('🔄 Processing test results...', results);
          
          // Only call handleTestCompletion for enrolled users (not practice mode)
          if (!results.isTemporary && results.enrollmentId) {
            await handleTestCompletion({
              correctAnswers: results.correctAnswers,
              totalQuestions: results.totalQuestions,
              score: results.score,
              passed: results.passed,
              courseId: results.courseId,
              courseTitle: results.courseTitle
            }, results.courseId);
            
            console.log('✅ Test results processed successfully');
          } else {
            console.log('📝 Practice mode - skipping enrollment updates');
          }
        } catch (error) {
          console.error('❌ Error processing test results:', error);
          if (showMessage) {
            showMessage('error', 'Failed to process test results: ' + error.message);
          }
        } finally {
          setIsProcessing(false);
        }
      };
      
      // ✅ MARK: Set the flag BEFORE processing
      hasProcessed.current = true;
      processResults();
      
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [results, navigate, handleTestCompletion, showMessage]); // ✅ Keep dependencies as they are

  // Rest of your component remains the same...
  const handleViewCertificate = () => {
    console.log('🎓 View certificate clicked for course:', results.courseId);
    
    // Find the enrollment for this course
    const enrollment = enrollments.find(e => 
      e.courseId === results.courseId || e.id === results.enrollmentId
    );
    
    console.log('🔍 Found enrollment for certificate:', enrollment);
    
    if (enrollment && (enrollment.completed || results.passed)) {
      const certificateData = {
        studentName: user?.username || user?.name || 'Student Name',
        studentId: user?.userId || 'N/A',
        course: {
          title: results.courseTitle,
          category: enrollment.courseCategory || 'General',
          instructorName: enrollment.instructorName || 'Instructor'
        },
        completionDate: enrollment.completionDate || new Date(),
        testScore: results.correctAnswers,
        totalQuestions: results.totalQuestions,
        percentage: results.score,
        passed: results.passed,
        enrollmentId: results.enrollmentId
      };
      
      console.log('📄 Certificate data prepared:', certificateData);
      navigate('/certificate', { state: { enrollment: certificateData } });
    } else {
      // Fallback certificate data for practice mode or edge cases
      const fallbackCertificate = {
        studentName: user?.username || user?.name || 'Student Name',
        studentId: user?.userId || 'N/A',
        course: {
          title: results.courseTitle,
          category: 'General',
          instructorName: 'Course Instructor'
        },
        completionDate: new Date(),
        testScore: results.correctAnswers,
        totalQuestions: results.totalQuestions,
        percentage: results.score,
        passed: results.passed,
        enrollmentId: results.enrollmentId,
        isPractice: results.isTemporary || !results.enrollmentId
      };
      
      console.log('📄 Fallback certificate data:', fallbackCertificate);
      navigate('/certificate', { state: { enrollment: fallbackCertificate } });
    }
  };

  const handleRetakeTest = () => {
    console.log('🔄 Retaking test for course:', results.courseId);
    
    // Navigate back to the course card or test start page
    if (results.enrollmentId && !results.isTemporary) {
      // For enrolled users, go back to dashboard where they can retake from CourseCard
      navigate('/dashboard');
    } else {
      // For practice mode, go back to where they started
      navigate(-2);
    }
  };

  const handleBackToDashboard = () => {
    console.log('🏠 Returning to dashboard');
    navigate('/dashboard');
  };

  if (!results) {
    return (
      <div className="test-results-page">
        <div className="results-loading">
          <div className="loading-spinner"></div>
          <p>Loading results...</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="quantum-btn quantum-action-btn"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { score, totalQuestions, correctAnswers, passed, courseTitle, courseId, isTemporary } = results;

  const getFeedbackMessage = () => {
    if (score >= 90) return "Outstanding! You've mastered this material! 🎯";
    if (score >= 80) return "Great job! You have a solid understanding. 👍";
    if (score >= 70) return "Good work! You passed with a decent score. ✅";
    if (score >= 60) return "You passed! Consider reviewing the material. 📚";
    return "Don't give up! Review the course and try again. 💪";
  };

  const getPerformanceLevel = () => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Satisfactory";
    return "Needs Improvement";
  };

  return (
    <div className="test-results-page">
      {/* Confetti effect */}
      {showConfetti &&
        Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="confetti"
            style={{
              left: `${Math.random() * 100}vw`,
              animationDelay: `${Math.random() * 2}s`,
              background: `hsl(${Math.random() * 360}, 70%, 60%)`,
            }}
          />
        ))}
      
      <div className="results-container quantum-glass">
        <div className="results-header">
          <h1>Test Results</h1>
          <h2>{courseTitle}</h2>
          {isTemporary && (
            <div className="practice-mode-badge">
              🧪 Practice Mode
            </div>
          )}
        </div>
        
        {/* Score Visual */}
        <div className="score-visual">
          <div 
            className={`score-circle ${passed ? 'passed' : 'failed'}`}
            style={{ '--score': score }}
          >
            <div className="score-value">{score}%</div>
            <div className="score-label">Overall Score</div>
          </div>
        </div>

        {/* Main Result Card */}
        <div className={`result-card ${passed ? 'passed' : 'failed'}`}>
          <div className="result-icon">
            {passed ? '🎉' : '📚'}
          </div>
          <div className="result-text">
            <h3>{passed ? 'Congratulations! You Passed!' : 'Keep Learning!'}</h3>
            <p>Your score: <strong>{score}%</strong></p>
            <p>Correct answers: <strong>{correctAnswers} out of {totalQuestions}</strong></p>
            <p>Performance: <strong>{getPerformanceLevel()}</strong></p>
            <p>Status: <strong className={passed ? 'success-text' : 'error-text'}>
              {passed ? 'PASSED' : 'FAILED'}
            </strong></p>
            {isTemporary && (
              <p className="practice-note">
                <small>🧪 This was a practice test. Results are not saved to your profile.</small>
              </p>
            )}
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="performance-breakdown">
          <h4>Performance Breakdown</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{score}%</span>
              <span className="stat-label">Overall Score</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{correctAnswers}/{totalQuestions}</span>
              <span className="stat-label">Correct Answers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{getPerformanceLevel()}</span>
              <span className="stat-label">Performance</span>
            </div>
          </div>
        </div>

        {/* Feedback Message */}
        <div className="feedback-message">
          <p>{getFeedbackMessage()}</p>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="processing-indicator">
            <div className="processing-spinner"></div>
            <p>Saving your results...</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="results-actions">
          <button 
            onClick={handleBackToDashboard}
            className="quantum-btn quantum-action-btn"
          >
            🏠 Back to Dashboard
          </button>
          
          {!passed && (
            <button 
              onClick={handleRetakeTest}
              className="quantum-btn quantum-btn-secondary"
            >
              🔄 Try Again
            </button>
          )}
          
          {passed && (
            <button 
              onClick={handleViewCertificate}
              className="quantum-btn quantum-certificate-btn"
              disabled={isProcessing}
            >
              🎓 View Certificate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestResults;