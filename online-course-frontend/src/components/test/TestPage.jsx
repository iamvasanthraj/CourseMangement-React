// components/test/TestPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import { testResultsAPI, enrollmentAPI } from '../../services/api';
import './TestPage.css';

const TestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { handleTestCompletion, refreshEnrollments, showMessage } = useDashboard();
  
  const testData = location.state;
  
  console.log('🧪 TestPage mounted with data:', testData);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    console.log('🔍 Validating test data...');
    
    if (!testData) {
      console.error('❌ No test data found');
      alert('No test data available. Redirecting to dashboard.');
      navigate('/dashboard');
      return;
    }

    if (!testData?.questions?.length) {
      console.error('❌ No questions found');
      alert('No questions available for this test.');
      navigate('/dashboard');
      return;
    }

    if (!testData.courseId || !testData.studentId) {
      console.error('❌ Missing required identifiers');
      alert('Required information missing. Please try again.');
      navigate('/dashboard');
      return;
    }

    console.log('✅ Test data validated:', {
      courseId: testData.courseId,
      studentId: testData.studentId,
      enrollmentId: testData.enrollmentId,
      isTemporary: testData.isTemporarySession,
      questionCount: testData.questions.length
    });

    // Set duration from testData or use default
    if (testData.duration) {
      setTimeLeft(testData.duration);
    }
  }, [testData, navigate]);

  useEffect(() => {
    if (timeLeft <= 0 && !hasAttempted) {
      setHasAttempted(true);
      handleSubmitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, hasAttempted]);

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  // Store test scores in localStorage as backup
  const storeTestScoresLocally = (courseId, testResults) => {
    try {
      const TEST_SCORES_KEY = 'course_test_scores';
      const existingScores = JSON.parse(localStorage.getItem(TEST_SCORES_KEY) || '{}');
      existingScores[`${courseId}_${testData.studentId}`] = {
        testScore: testResults.correctAnswers,
        totalQuestions: testResults.totalQuestions,
        percentage: testResults.score,
        passed: testResults.passed,
        timestamp: new Date().toISOString(),
        courseTitle: testResults.courseTitle
      };
      localStorage.setItem(TEST_SCORES_KEY, JSON.stringify(existingScores));
      console.log('💾 Test scores stored locally:', existingScores);
    } catch (error) {
      console.error('❌ Failed to store test scores locally:', error);
    }
  };

  const countCorrectAnswers = () => {
    let correct = 0;
    testData.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    
    console.log('✅ Correct answers counted:', {
      correct,
      total: testData.questions.length,
      answersGiven: Object.keys(answers).length
    });
    
    return correct;
  };

  // ✅ ADD: Function to update enrollment with test results
// In your TestPage.js - UPDATE the updateEnrollmentWithTestResults function
// In your TestPage.js - UPDATE to ensure correct data is sent
// In your TestPage.js - UPDATE the updateEnrollmentWithTestResults function
const updateEnrollmentWithTestResults = async (enrollmentId, testResults) => {
  try {
    console.log('🎓 === UPDATING ENROLLMENT WITH TEST RESULTS ===');
    console.log('📊 Test Results:', {
      correctAnswers: testResults.correctAnswers,
      totalQuestions: testResults.totalQuestions,
      score: testResults.score,
      passed: testResults.passed,
      enrollmentId: enrollmentId
    });

    // ✅ CRITICAL: Ensure completed is ONLY true when test is passed
    const updateData = {
      testScore: testResults.correctAnswers,
      totalQuestions: testResults.totalQuestions,
      percentage: testResults.score,
      passed: testResults.passed,
      completed: testResults.passed, // THIS MUST BE false WHEN TEST FAILS
      ...(testResults.passed && { 
        completionDate: new Date().toISOString() 
      })
    };

    console.log('📤 FINAL UPDATE DATA BEING SENT TO BACKEND:');
    console.log('   - completed:', updateData.completed);
    console.log('   - passed:', updateData.passed);
    console.log('   - testScore:', updateData.testScore);
    console.log('   - totalQuestions:', updateData.totalQuestions);
    console.log('   - percentage:', updateData.percentage);

    if (updateData.completed && !testResults.passed) {
      console.error('🚨 CRITICAL BUG: completed is true but test failed!');
      console.error('🚨 This should never happen! Fixing it...');
      // Force fix the bug
      updateData.completed = false;
      delete updateData.completionDate;
      console.log('✅ Emergency fix applied: completed set to false');
    }
    
    const result = await enrollmentAPI.completeCourse(enrollmentId, updateData);
    console.log('✅ Enrollment update completed');
    return result;
  } catch (error) {
    console.error('❌ Failed to update enrollment:', error);
    throw error;
  }
};

  const handleSubmitTest = async () => {
    if (isSubmitting || hasAttempted) return;

    try {
      setIsSubmitting(true);
      setHasAttempted(true);
      
      const correctAnswers = countCorrectAnswers();
      const totalQuestions = testData.questions.length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = correctAnswers >= 6; // 6/10 to pass

      console.log('🚀 ========== TEST SUBMISSION STARTED ==========');
      console.log('📊 Test results:', {
        correctAnswers,
        totalQuestions,
        score,
        passed,
        enrollmentId: testData.enrollmentId,
        courseId: testData.courseId,
        studentId: testData.studentId,
        isTemporarySession: testData.isTemporarySession
      });

      // Store in localStorage as backup
      storeTestScoresLocally(testData.courseId, {
        correctAnswers,
        totalQuestions,
        score,
        passed,
        courseTitle: testData.courseTitle
      });

      // ✅ MYSQL SAVE - For enrolled users (not temporary sessions)
      if (testData.enrollmentId && !testData.isTemporarySession) {
        console.log('💾 Saving to MySQL database...');
        
        const testResultData = {
          enrollmentId: testData.enrollmentId,
          courseId: testData.courseId,
          studentId: testData.studentId,
          testScore: correctAnswers,
          totalQuestions: totalQuestions,
          percentage: score,
          passed: passed,
          submittedAt: new Date().toISOString()
        };

        try {
          // 1. Save test results to MySQL
          const result = await testResultsAPI.saveTestResult(testResultData);
          console.log('✅ MySQL test results saved:', result);
          
          // 2. Update enrollment with test scores and completion status
          await updateEnrollmentWithTestResults(testData.enrollmentId, {
            correctAnswers,
            totalQuestions,
            score,
            passed,
            courseId: testData.courseId,
            courseTitle: testData.courseTitle
          });

          // 3. Use handleTestCompletion for additional processing
          if (handleTestCompletion) {
            console.log('🎓 Calling handleTestCompletion...');
            await handleTestCompletion({
              correctAnswers,
              totalQuestions,
              score,
              passed,
              courseId: testData.courseId,
              courseTitle: testData.courseTitle
            }, testData.courseId);
          }
          
          // 4. Refresh enrollments to get updated data
          if (refreshEnrollments) {
            await refreshEnrollments();
          }

          // 5. Show success message
          if (showMessage) {
            const message = passed ? 
              `🎉 Congratulations! You passed the test with ${correctAnswers}/${totalQuestions} (${score}%)` :
              `📝 Test completed! Score: ${correctAnswers}/${totalQuestions} (${score}%) - Try again to pass.`;
            showMessage('success', message);
          }

        } catch (error) {
          console.error('❌ MySQL save failed:', error);
          // Show error but continue to results page
          if (showMessage) {
            showMessage('error', 'Test completed but failed to save results. Please try again.');
          }
        }
      } else {
        console.log('📝 Practice mode - results not saved to database');
        if (showMessage) {
          showMessage('info', `Practice test completed! Score: ${correctAnswers}/${totalQuestions} (${score}%)`);
        }
      }

      // Send message to CourseCard for real-time updates
      console.log('📢 Sending TEST_COMPLETED message...');
      window.postMessage({
        type: 'TEST_COMPLETED',
        courseId: testData.courseId,
        testResults: {
          correctAnswers,
          totalQuestions,
          score,
          passed,
          enrollmentId: testData.enrollmentId
        }
      }, '*');
      console.log('✅ Message sent');

      // Navigate to results page
      console.log('🎯 Navigating to results page...');
      navigate('/test-results', { 
        state: { 
          testCompleted: true,
          score,
          totalQuestions,
          correctAnswers,
          passed,
          courseTitle: testData.courseTitle,
          courseId: testData.courseId,
          enrollmentId: testData.enrollmentId,
          isTemporary: testData.isTemporarySession,
          savedToDatabase: !!testData.enrollmentId && !testData.isTemporarySession
        }
      });
      
    } catch (error) {
      console.error('❌ Test submission error:', error);
      
      // Fallback navigation
      const correctAnswers = countCorrectAnswers();
      const totalQuestions = testData.questions.length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = correctAnswers >= 6;
      
      navigate('/test-results', { 
        state: { 
          testCompleted: true,
          score,
          totalQuestions,
          correctAnswers,
          passed,
          courseTitle: testData.courseTitle,
          courseId: testData.courseId,
          error: true,
          errorMessage: error.message
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!testData?.questions) {
    return (
      <div className="test-loading">
        <div>Loading test...</div>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  const question = testData.questions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / testData.questions.length) * 100;

  return (
    <div className="quantum-test-page">
      <header className="test-header">
        <h1>Test: {testData.courseTitle || 'Course Test'}</h1>
        <div className="test-timer">
          Time Left: <span className={timeLeft < 60 ? 'time-warning' : ''}>
            {formatTime(timeLeft)}
          </span>
        </div>
        {testData.isTemporarySession && (
          <div className="test-mode-badge">
            Practice Mode
          </div>
        )}
        
        {/* Debug info */}
        <div style={{fontSize: '12px', marginTop: '5px', color: '#666'}}>
          Course: {testData.courseId} | 
          Enrollment: {testData.enrollmentId || 'None'} | 
          Questions: {testData.questions?.length}
        </div>
      </header>

      <div className="test-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="progress-text">
          Question {currentQuestion + 1} of {testData.questions.length}
        </div>
      </div>

      <div className="test-question">
        <h3>{question.question}</h3>
        <div className="test-options">
          {question.options.map((option, index) => (
            <label key={index} className="option-label">
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                checked={answers[currentQuestion] === index}
                onChange={() => handleAnswerSelect(currentQuestion, index)}
                disabled={isSubmitting}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="test-navigation">
        <button
          className="quantum-btn quantum-btn-secondary"
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0 || isSubmitting}
        >
          Previous
        </button>
        
        <div className="question-counter">
          {currentQuestion + 1} / {testData.questions.length}
        </div>
        
        {currentQuestion === testData.questions.length - 1 ? (
          <button 
            className="quantum-btn quantum-action-btn"
            onClick={handleSubmitTest}
            disabled={isSubmitting || hasAttempted}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </button>
        ) : (
          <button
            className="quantum-btn quantum-btn-primary"
            onClick={() => setCurrentQuestion(prev => prev + 1)}
            disabled={isSubmitting}
          >
            Next
          </button>
        )}
      </div>

      {isSubmitting && (
        <div className="test-submitting">
          <p>Processing your results...</p>
        </div>
      )}
    </div>
  );
};

export default TestPage;