// components/layout/Navigation.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  X,
  AlertTriangle
} from "lucide-react";
import "./Navigation.css";

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowLogoutConfirm(false);
  };

  const openLogoutModal = () => setShowLogoutConfirm(true);
  const closeLogoutModal = () => setShowLogoutConfirm(false);

  const handleProfileClick = () => navigate("/profile");

  const menuConfig = {
    base: [{ path: "/dashboard", label: "Dashboard", icon: <Home size={20} /> }],
    student: [{ path: "/my-enrollments", label: "My Enrollments", icon: <GraduationCap size={20} /> }],
    instructor: [{ path: "/my-courses", label: "My Courses", icon: <BookOpen size={20} /> }]
  };

  const menuItems = [
    ...menuConfig.base,
    ...(user?.role === "STUDENT" ? menuConfig.student : []),
    ...(user?.role === "INSTRUCTOR" ? menuConfig.instructor : [])
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside className={`quantum-sidebar ${collapsed ? "collapsed" : ""}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <h2 className="sidebar-title">Let's Learn</h2>
          <p className="sidebar-tagline">Learn. Grow. Achieve.</p>
          {/* <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button> */}
        </div>

        {/* Profile Section */}
        <div
          className="sidebar-profile-section"
          onClick={handleProfileClick}
          title={`${user?.username} • ${user?.role}`}
        >
          <div className="profile-avatar-large">
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="profile-info-compact">
              <div className="profile-name">
                {user?.username ? user.username.split(' ')[0].slice(0, 10) : 'User'}
              </div>
              <div className="profile-role-badge">
                {user?.role === "INSTRUCTOR" ? "👨‍🏫" : "🎓"} {user?.role}
              </div>
              <div className="profile-email" title={user?.email}>
                {user?.email}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {menuItems.map((item) => (
              <li key={item.path} className="nav-item">
                <button
                  className={`nav-link ${isActive(item.path) ? "active" : ""}`}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : ""}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!collapsed && <span className="nav-label">{item.label}</span>}
                  {isActive(item.path) && !collapsed && (
                    <span className="active-indicator">●</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer / Logout */}
        <div className="sidebar-footer">
          <button 
            className="logout-btn" 
            onClick={openLogoutModal} 
            title={collapsed ? "Logout" : "Logout from your account"}
          >
            <LogOut size={20} className="logout-icon" />
            {!collapsed && <span className="logout-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Enhanced Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={closeLogoutModal}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-icon-wrapper">
                <AlertTriangle size={24} className="modal-warning-icon" />
              </div>
              <button className="modal-close-btn" onClick={closeLogoutModal}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="modal-content">
              <h3 className="modal-title">Confirm Logout</h3>
              <p className="modal-description">
                Are you sure you want to logout from your account? 
                You'll need to sign in again to access your courses and progress.
              </p>
              
              {/* User Info Card */}
              <div className="user-info-card">
                <div className="user-avatar-small">
                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="user-details">
                  <div className="user-name">{user?.username || "User"}</div>
                  <div className="user-email">{user?.email || "No email"}</div>
                  <div className="user-role-tag">{user?.role || "User"}</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-actions">
              <button 
                className="modal-btn modal-btn-cancel" 
                onClick={closeLogoutModal}
              >
                Cancel
              </button>
              <button 
                className="modal-btn modal-btn-confirm" 
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;