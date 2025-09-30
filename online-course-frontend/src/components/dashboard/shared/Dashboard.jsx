// components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDashboard } from '../../../hooks/useDashboard';
import StudentDashboard from '../student/StudentDashboard';
import InstructorDashboard from '../instructor/InstructorDashboard';
import "../../../styles/dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    courses,
    enrollments,
    loading,
    enrollingCourseId,
    handleEnroll,
    showMessage,
    message
  } = useDashboard();

  const [filter, setFilter] = useState('ALL');
  const categories = ['ALL', 'BACKEND', 'FRONTEND', 'CYBERSECURITY', 'DATABASE', 'MOBILE', 'DEVOPS'];

  // Test completion handler
  useEffect(() => {
    if (location.state?.testCompleted) {
      const { score, totalQuestions, passed, courseMarkedComplete } = location.state;
      const correctCount = Math.round((score / 100) * totalQuestions);
      
      let messageText = `Test completed! ${correctCount}/${totalQuestions} correct (${score}%) - ${passed ? 'PASSED ✅' : 'FAILED ❌'}`;
      if (passed && courseMarkedComplete) {
        messageText += ' - Course marked as completed! 🎓';
      }
      
      showMessage('success', messageText);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showMessage]);

  if (!user) {
    return (
      <div className="quantum-dashboard">
        <div className="loading-state">
          <div className="quantum-loading">Please log in to access the dashboard.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="quantum-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="page-title">Welcome back, {user?.username}! 👋</h1>
          <p className="page-subtitle">
            Role: {user?.role} • 
            <span 
              className="enrollments-link" 
              onClick={() => navigate('/my-enrollments')}
              style={{ cursor: 'pointer', color: '#6366f1', marginLeft: '10px' }}
            >
              🎓 View My Enrollments ({enrollments.length})
            </span>
          </p>
        </div>
      </header>

      {message.text && (
        <div className={`quantum-message quantum-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      {/* Render role-specific dashboard */}
      {user?.role === 'INSTRUCTOR' && <InstructorDashboard />}
      
      {user?.role === 'STUDENT' && (
        <StudentDashboard 
          filter={filter}
          setFilter={setFilter}
          categories={categories}
        />
      )}
    </div>
  );
};

export default Dashboard;