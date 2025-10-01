// components/layout/Navigation.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  // Role-specific menu items - UPDATED TO MATCH ACTUAL ROUTES
  const roleMenuItems = [
    // For STUDENTS: Show "My Enrollments"
    ...(user?.role === 'STUDENT' ? [
      { path: '/my-enrollments', label: 'My Enrollments', icon: '🎓' }
    ] : []),
    
    // For INSTRUCTORS: Show "My Courses"
    ...(user?.role === 'INSTRUCTOR' ? [
      { path: '/my-courses', label: 'My Courses', icon: '📚' }
    ] : [])
  ];

  // Base menu items - REMOVED PROFILE FROM HERE
  const baseMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' }
    // Profile removed - using the clickable profile section above instead
  ];

  // Combine all menu items
  const menuItems = [...baseMenuItems, ...roleMenuItems];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="quantum-sidebar">
      {/* Profile Section at the Top - Clickable to go to Profile Page */}
      <div className="sidebar-profile-section" onClick={handleProfileClick}>
        <div className="profile-avatar-large">
          {user?.username?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="profile-info-compact">
          <h6 className="profile-name">{user?.username}</h6>
          <p className="profile-role-badge">
            <span className="role-icon">
              {user?.role === 'INSTRUCTOR' ? '👨‍🏫' : '🎓'}
            </span>
            {user?.role}
          </p>
          <p className="profile-email">{user?.email}</p>
        </div>
        <div className="profile-edit-hint">
          {/* <span>👆 Click to view profile</span> */}
        </div>
      </div>

      <div className="sidebar-header">
        <h2 className="sidebar-title">LETS's Learn</h2>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <button
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {isActive(item.path) && <span className="active-indicator">●</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          <span className="logout-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Navigation;