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
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if no test data
  useEffect(() => {
    if (!testData?.questions?.length || !testData.enrollmentId) {
      console.error('❌ No test data found, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [testData, navigate]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

const handleSubmitTest = async () => {
  if (isSubmitting) return;

  try {
    setIsSubmitting(true);
    
    // Calculate score
    const score = calculateScore();
    const passed = score >= 60; // 6 out of 10 = 60%
    
    console.log('📊 Test results:', {
      score,
      totalQuestions: testData.questions.length,
      passed,
      answers
    });

    // Submit results
    console.log('🔄 Submitting test results...');
    const result = await enrollmentAPI.submitTestResults(testData.enrollmentId, {
      score,
      totalQuestions: testData.questions.length,
      answers,
      studentId: testData.studentId,
      courseId: testData.courseId,
      passed,
      submittedAt: new Date().toISOString()
    });
    
    console.log('✅ Test results submitted successfully:', result);

    // ✅ If test passed, mark course as completed
    if (passed) {
      console.log('🎉 Test passed! Marking course as completed...');
      try {
        await enrollmentAPI.markComplete(testData.enrollmentId);
        console.log('✅ Course marked as completed');
      } catch (markCompleteError) {
        console.error('❌ Error marking course as completed:', markCompleteError);
        // Continue even if this fails - the test results are already saved
      }
    }

    // Navigate back to dashboard with success message
    navigate('/dashboard', { 
      state: { 
        testCompleted: true,
        score,
        totalQuestions: testData.questions.length,
        passed,
        courseMarkedComplete: passed // ✅ Flag to show course completion
      }
    });
    
  } catch (error) {
    console.error('❌ Error submitting test:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Show more specific error message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data || 
                        error.message || 
                        'Failed to submit test results';
    
    alert(`Error: ${errorMessage}. Please try again or contact support.`);
  } finally {
    setIsSubmitting(false);
  }
};

  const calculateScore = () => {
    let correct = 0;
    testData.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / testData.questions.length) * 100);
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

  return (
    <div className="quantum-test-page">
      <header className="test-header">
        <h1>Test: {testData.courseTitle || 'Course Test'}</h1>
        <div className="test-timer">
          Time Left: <span className={timeLeft < 60 ? 'time-warning' : ''}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </header>

      <div className="test-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentQuestion + 1) / testData.questions.length) * 100}%` }}
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
          disabled={currentQuestion === 0}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </button>
        ) : (
          <button
            className="quantum-btn quantum-btn-primary"
            onClick={() => setCurrentQuestion(prev => prev + 1)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default TestPage;