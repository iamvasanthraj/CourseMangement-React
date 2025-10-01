// components/shared/Unauthorized.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Unauthorized.css';

// Fallback constants if the import fails
const USER_ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin'
};

const ROLE_LABELS = {
  student: 'Student',
  instructor: 'Instructor',
  admin: 'Administrator'
};

const ROLE_ICONS = {
  student: '🎓',
  instructor: '👨‍🏫',
  admin: '⚡'
};

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const attemptedPath = location.state?.from?.pathname || location.pathname;
  
  // Define allowed roles for different routes
  const getRouteRequirements = () => {
    const routeRoleMap = {
      '/instructor-dashboard': [USER_ROLES.INSTRUCTOR],
      '/my-courses': [USER_ROLES.INSTRUCTOR],
      '/student-dashboard': [USER_ROLES.STUDENT],
      '/my-enrollments': [USER_ROLES.STUDENT],
    };
    
    return routeRoleMap[attemptedPath] || [USER_ROLES.STUDENT, USER_ROLES.INSTRUCTOR];
  };

  const allowedRoles = getRouteRequirements();
  const currentRole = user?.role;

  // Get role display name with fallback
  const getRoleDisplayName = (role) => {
    return ROLE_LABELS[role] || role || 'Unknown Role';
  };

  return (
    <div className={`unauthorized-container ${currentRole ? `role-${currentRole.toLowerCase()}` : ''}`}>
      <div className="unauthorized-content">
        <div className="error-icon">🚫</div>
        <h1>Access Denied</h1>
        <p>
          You don't have permission to access this page. 
          {currentRole && ` Your current role (${getRoleDisplayName(currentRole)}) doesn't have access to this resource.`}
        </p>

        {/* Role Information Section */}
        <div className="role-info">
          <h3>
            <span className="info-icon">ℹ️</span>
            Access Information
          </h3>
          // components/shared/Unauthorized.jsx - Remove admin sections
// In the role-details section, remove the admin line:
<div className="role-details">
  <div className="role-detail">
    <span className={`status-icon ${allowedRoles.includes('STUDENT') ? 'allowed' : 'denied'}`}></span>
    <span>Student Access: {allowedRoles.includes('STUDENT') ? 'Allowed' : 'Not Allowed'}</span>
  </div>
  <div className="role-detail">
    <span className={`status-icon ${allowedRoles.includes('INSTRUCTOR') ? 'allowed' : 'denied'}`}></span>
    <span>Instructor Access: {allowedRoles.includes('INSTRUCTOR') ? 'Allowed' : 'Not Allowed'}</span>
  </div>
  {/* REMOVE ADMIN SECTION */}
</div>
         
        </div>

        <div className="action-buttons">
          <button 
            onClick={() => navigate('/dashboard')}
            className="quantum-btn quantum-btn-primary"
          >
            🏠 Go to Dashboard
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="quantum-btn quantum-btn-secondary"
          >
            ↩️ Go Back
          </button>
          {currentRole === USER_ROLES.STUDENT && (
            <button 
              onClick={() => navigate('/student-dashboard')}
              className="quantum-btn quantum-btn-secondary"
            >
              📚 Student Dashboard
            </button>
          )}
          {currentRole === USER_ROLES.INSTRUCTOR && (
            <button 
              onClick={() => navigate('/instructor-dashboard')}
              className="quantum-btn quantum-btn-secondary"
            >
              📊 Instructor Dashboard
            </button>
          )}
        </div>

        <div className="contact-support">
          <p>If you believe this is an error, please contact support.</p>
          <a href="mailto:support@quantumlearn.com" className="support-link">
            📧 Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;