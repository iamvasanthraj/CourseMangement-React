import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Base menu items for all users
  const baseMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  // Role-specific menu items
  const roleMenuItems = [
    // For STUDENTS: Show "My Enrollments" instead of generic "Enrollments"
    ...(user?.role === 'STUDENT' ? [
      { path: '/my-enrollments', label: 'My Enrollments', icon: '🎓' }
    ] : []),
    
    // For INSTRUCTORS: Show "My Courses"
    ...(user?.role === 'INSTRUCTOR' ? [
      { path: '/enrollments', label: 'My Courses', icon: '📚' }
    ] : [])
  ];

  // Combine base and role-specific menu items
  const menuItems = [...baseMenuItems, ...roleMenuItems];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="quantum-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Quantum Learn</h2>
        <div className="user-info">
          <span className="user-avatar">
            {user?.role === 'INSTRUCTOR' ? '👨‍🏫' : '👨‍🎓'}
          </span>
          <div className="user-details">
            <span className="username">{user?.username}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
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