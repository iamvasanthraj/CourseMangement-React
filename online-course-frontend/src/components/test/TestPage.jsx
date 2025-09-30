import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { enrollmentAPI } from '../../services/api';
import './TestPage.css';

const TestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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

  const handleSubmitTest = async () => {
    if (isSubmitting || hasAttempted) return;

    try {
      setIsSubmitting(true);
      setHasAttempted(true);
      
      const score = calculateScore();
      const passed = score >= 60;
      const correctAnswers = countCorrectAnswers();
      
      console.log('📊 Test results:', {
        score,
        totalQuestions: testData.questions.length,
        correctAnswers,
        passed,
        isTemporarySession: testData.isTemporarySession
      });

      // For temporary sessions (without enrollment ID), just show results
      if (testData.isTemporarySession) {
        console.log('📝 Temporary test session - showing results only');
        
        navigate('/test-results', { 
          state: { 
            testCompleted: true,
            score,
            totalQuestions: testData.questions.length,
            correctAnswers,
            passed,
            courseTitle: testData.courseTitle,
            courseId: testData.courseId,
            isTemporary: true
          }
        });
        return;
      }

      // For enrolled users with enrollment ID, submit to backend
      if (testData.enrollmentId && !testData.isTemporarySession) {
        console.log('💾 Submitting test results to backend...');
        
        const result = await enrollmentAPI.submitTestResults(testData.enrollmentId, {
          score,
          totalQuestions: testData.questions.length,
          correctAnswers,
          answers,
          studentId: testData.studentId,
          courseId: testData.courseId,
          passed,
          submittedAt: new Date().toISOString(),
          timeSpent: (5 * 60) - timeLeft
        });
        
        console.log('✅ Test results submitted:', result);

        // Mark course as completed if passed
        if (passed) {
          try {
            await enrollmentAPI.markComplete(testData.enrollmentId);
            console.log('✅ Course marked as completed');
          } catch (markCompleteError) {
            console.error('❌ Error marking course as completed:', markCompleteError);
          }
        }
      }

      // Navigate to results page
      navigate('/test-results', { 
        state: { 
          testCompleted: true,
          score,
          totalQuestions: testData.questions.length,
          correctAnswers,
          passed,
          courseTitle: testData.courseTitle,
          courseId: testData.courseId,
          isTemporary: testData.isTemporarySession
        }
      });
      
    } catch (error) {
      console.error('❌ Error processing test:', error);
      
      // Even if submission fails, show results to user
      const score = calculateScore();
      const correctAnswers = countCorrectAnswers();
      const passed = score >= 60;
      
      navigate('/test-results', { 
        state: { 
          testCompleted: true,
          score,
          totalQuestions: testData.questions.length,
          correctAnswers,
          passed,
          courseTitle: testData.courseTitle,
          courseId: testData.courseId,
          error: true,
          errorMessage: error.response?.data?.message || error.message
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateScore = () => {
    const correct = countCorrectAnswers();
    return Math.round((correct / testData.questions.length) * 100);
  };

  const countCorrectAnswers = () => {
    let correct = 0;
    testData.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return correct;
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