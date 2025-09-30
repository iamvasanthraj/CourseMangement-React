import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TestResults.css';

const TestResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!results) {
      navigate('/dashboard');
      return;
    }

    // Show confetti if passed
    if (results.passed) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [results, navigate]);

  if (!results) {
    return (
      <div className="test-results-page">
        <div className="results-loading">
          <div className="loading-spinner"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  const { score, totalQuestions, correctAnswers, passed, courseTitle } = results;

  const getFeedbackMessage = () => {
    if (score >= 90) return "Outstanding! You've mastered this material!";
    if (score >= 80) return "Great job! You have a solid understanding.";
    if (score >= 70) return "Good work! You passed with a decent score.";
    if (score >= 60) return "You passed! Consider reviewing the material.";
    return "Don't give up! Review the course and try again.";
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
        <h1>Test Results</h1>
        <h2>{courseTitle}</h2>
        
        {/* Score Visual */}
        <div className="score-visual">
          <div 
            className="score-circle" 
            style={{ '--score': score }}
          >
            <div className="score-value">{score}%</div>
          </div>
        </div>

        <div className={`result-card ${passed ? 'passed' : 'failed'}`}>
          <div className="result-icon">
            {passed ? '🎉' : '📚'}
          </div>
          <div className="result-text">
            <h3>{passed ? 'Congratulations! You Passed!' : 'Keep Learning!'}</h3>
            <p>Your score: <strong>{score}%</strong></p>
            <p>Correct answers: <strong>{correctAnswers} out of {totalQuestions}</strong></p>
            <p>Status: <strong className={passed ? 'success-text' : 'error-text'}>
              {passed ? 'PASSED' : 'FAILED'}
            </strong></p>
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
              <span className="stat-value">{passed ? '✅' : '❌'}</span>
              <span className="stat-label">Result</span>
            </div>
          </div>
        </div>

        {/* Feedback Message */}
        <div className="feedback-message">
          {getFeedbackMessage()}
        </div>

        <div className="results-actions">
          <button 
            onClick={() => navigate('/dashboard')}
            className="quantum-btn quantum-action-btn"
          >
            🏠 Back to Dashboard
          </button>
          
          {!passed && (
            <button 
              onClick={() => navigate(-2)}
              className="quantum-btn quantum-btn-secondary"
            >
              🔄 Try Again
            </button>
          )}
          
          {passed && (
            <button 
              onClick={() => navigate('/enrollments')}
              className="quantum-btn quantum-btn-secondary"
            >
              🎓 View Certificates
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestResults;