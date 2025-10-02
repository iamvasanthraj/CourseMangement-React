import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useDashboard } from '../../../hooks/useDashboard';
import { 
  User, UserCircle, UserCheck, UserCog, UserPlus, UserX, 
  GraduationCap, BookOpen, Shield, Crown, Star, Zap,
  Bot, Ghost, Cat, Dog, Rabbit, Bird, Fish, Gamepad2,
  Palette, Music, Camera, Heart, Sparkles, Edit3, Save, X
} from 'lucide-react';
import './ProfilePage.css';

const DEFAULT_AVATARS = [
  { icon: User, color: '#3B82F6', name: 'Basic User' },
  { icon: UserCircle, color: '#10B981', name: 'Circle User' },
  { icon: UserCheck, color: '#8B5CF6', name: 'Verified User' },
  { icon: UserCog, color: '#F59E0B', name: 'Admin User' },
  { icon: UserPlus, color: '#EC4899', name: 'New User' },
  { icon: UserX, color: '#EF4444', name: 'Limited User' },
  { icon: GraduationCap, color: '#06B6D4', name: 'Student' },
  { icon: BookOpen, color: '#84CC16', name: 'Scholar' },
  { icon: Shield, color: '#6366F1', name: 'Protector' },
  { icon: Crown, color: '#F59E0B', name: 'VIP' },
  { icon: Star, color: '#EAB308', name: 'Star' },
  { icon: Zap, color: '#F97316', name: 'Energy' },
  { icon: Bot, color: '#6B7280', name: 'Bot' },
  { icon: Ghost, color: '#8B5CF6', name: 'Ghost' },
  { icon: Cat, color: '#F59E0B', name: 'Cat' },
  { icon: Dog, color: '#DC2626', name: 'Dog' },
  { icon: Rabbit, color: '#EC4899', name: 'Rabbit' },
  { icon: Bird, color: '#10B981', name: 'Bird' },
  { icon: Palette, color: '#8B5CF6', name: 'Artist' },
  { icon: Music, color: '#EC4899', name: 'Musician' }
];

const ProfilePage = () => {
  const { user, updateProfile, changePassword, updateAvatar } = useAuth();
  const { courses, enrollments, loading } = useDashboard();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    profile: false,
    password: false,
    avatar: false
  });
  const [messages, setMessages] = useState({
    success: '',
    error: ''
  });

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || 0
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [passwordError, setPasswordError] = useState('');

  const clearMessages = () => {
    setTimeout(() => {
      setMessages({ success: '', error: '' });
    }, 5000);
  };

  const getCurrentAvatar = () => {
    const avatarIndex = user?.avatar !== undefined ? user.avatar : formData.avatar;
    return DEFAULT_AVATARS[avatarIndex] || DEFAULT_AVATARS[0];
  };

  const handleAvatarSelect = async (avatarIndex) => {
    setLoadingStates(prev => ({ ...prev, avatar: true }));
    
    try {
      await updateAvatar(avatarIndex);
      
      setMessages({ 
        success: 'Avatar updated successfully!', 
        error: '' 
      });
      setShowAvatarPicker(false);
      clearMessages();
    } catch (error) {
      console.error('❌ Avatar update error:', error);
      setMessages({ 
        error: 'Failed to update avatar. Please try again.', 
        success: '' 
      });
      clearMessages();
    } finally {
      setLoadingStates(prev => ({ ...prev, avatar: false }));
    }
  };

  const userCourses = user?.role === 'INSTRUCTOR' 
    ? courses.filter(course => course.instructorId === user?.userId)
    : enrollments;

  const completedCourses = enrollments.filter(e => e.completed).length;
  const inProgressCourses = enrollments.filter(e => !e.completed).length;
  
  const averageRating = user?.role === 'INSTRUCTOR' 
    ? courses.reduce((acc, course) => {
        const rating = course.averageRating !== undefined 
          ? (typeof course.averageRating === 'number' ? course.averageRating : parseFloat(course.averageRating) || 0)
          : 0;
        return acc + rating;
      }, 0) / (courses.length || 1)
    : null;

  const totalStudents = courses.reduce((acc, course) => {
    const students = course.enrolledStudents || 0;
    return acc + students;
  }, 0);

  const totalRevenue = courses.reduce((acc, course) => {
    const price = parseFloat(course.price) || 0;
    const students = course.enrolledStudents || 0;
    return acc + (price * students);
  }, 0);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    setPasswordError('');
  };

  const handleSaveProfile = async () => {
    if (!formData.username.trim()) {
      setMessages({ error: 'Username is required', success: '' });
      clearMessages();
      return;
    }

    if (!formData.email.trim()) {
      setMessages({ error: 'Email is required', success: '' });
      clearMessages();
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setMessages({ error: 'Please enter a valid email address', success: '' });
      clearMessages();
      return;
    }

    setLoadingStates(prev => ({ ...prev, profile: true }));
    setMessages({ success: '', error: '' });

    try {
      console.log('💾 Saving profile data:', formData);
      await updateProfile(formData);
      
      setMessages({ 
        success: 'Profile updated successfully!', 
        error: '' 
      });
      setIsEditing(false);
      clearMessages();
    } catch (error) {
      console.error('❌ Profile update error:', error);
      setMessages({ 
        error: error.message || 'Failed to update profile. Please try again.', 
        success: '' 
      });
      clearMessages();
    } finally {
      setLoadingStates(prev => ({ ...prev, profile: false }));
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setLoadingStates(prev => ({ ...prev, password: true }));
    setPasswordError('');
    setMessages({ success: '', error: '' });

    try {
      console.log('🔐 Changing password...');
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setMessages({ 
        success: 'Password changed successfully!', 
        error: '' 
      });
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      clearMessages();
    } catch (error) {
      console.error('❌ Password change error:', error);
      setPasswordError(error.message || 'Failed to change password. Please check your current password.');
    } finally {
      setLoadingStates(prev => ({ ...prev, password: false }));
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      avatar: user?.avatar || 0
    });
    setIsEditing(false);
    setMessages({ success: '', error: '' });
  };

  const handleCancelPasswordChange = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError('');
    setIsChangingPassword(false);
    setMessages({ success: '', error: '' });
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setFormData({
        username: user?.username || '',
        email: user?.email || '',
        avatar: user?.avatar || 0
      });
    }
    setIsEditing(!isEditing);
  };

  const currentAvatar = getCurrentAvatar();

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-state">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {(messages.success || messages.error) && (
        <div className={`message-banner ${messages.success ? 'success' : 'error'}`}>
          {messages.success || messages.error}
        </div>
      )}

      {showAvatarPicker && (
        <div className="avatar-picker-modal">
          <div className="avatar-picker-content">
            <div className="avatar-picker-header">
              <h3>Choose Your Avatar</h3>
              <button 
                onClick={() => setShowAvatarPicker(false)}
                className="close-button"
              >
                ×
              </button>
            </div>
            <div className="avatars-grid">
              {DEFAULT_AVATARS.map((avatar, index) => {
                const IconComponent = avatar.icon;
                const isSelected = (user?.avatar !== undefined ? user.avatar : formData.avatar) === index;
                
                return (
                  <div
                    key={index}
                    className={`avatar-option ${isSelected ? 'selected' : ''} ${loadingStates.avatar ? 'loading' : ''}`}
                    onClick={() => !loadingStates.avatar && handleAvatarSelect(index)}
                    title={avatar.name}
                  >
                    <div 
                      className="avatar-icon-wrapper"
                      style={{ backgroundColor: avatar.color }}
                    >
                      <IconComponent size={24} color="white" />
                    </div>
                    {isSelected && <div className="selected-indicator">✓</div>}
                  </div>
                );
              })}
            </div>
            <div className="avatar-picker-actions">
              <button 
                onClick={() => setShowAvatarPicker(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-header">
        <div className="header-content">
          <div className="avatar-section">
            <div 
              className="profile-avatar"
              style={{ backgroundColor: currentAvatar.color }}
              onClick={() => isEditing && setShowAvatarPicker(true)}
            >
              <currentAvatar.icon size={32} color="white" />
            </div>
            {isEditing && (
              <button 
                className="avatar-edit-btn" 
                title="Change Avatar"
                onClick={() => setShowAvatarPicker(true)}
                disabled={loadingStates.avatar}
              >
                {loadingStates.avatar ? '...' : '📷'}
              </button>
            )}
          </div>
          <div className="profile-info">
            <div className="profile-name-section">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="edit-input name-input"
                  placeholder="Enter your name"
                  disabled={loadingStates.profile}
                />
              ) : (
                <h1 className="profile-name">
                  {user?.username || 'User Name'}
                </h1>
              )}
              <button 
                className="edit-toggle-btn"
                onClick={handleEditToggle}
                disabled={loadingStates.profile}
              >
                {isEditing ? (
                  <X size={20} />
                ) : (
                  <Edit3 size={20} />
                )}
              </button>
            </div>
            <p className="profile-email">
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="edit-input email-input"
                  placeholder="Enter your email"
                  disabled={loadingStates.profile}
                />
              ) : (
                user?.email
              )}
            </p>
            <p className="profile-role">
              {user?.role === 'INSTRUCTOR' ? '👨‍🏫 Instructor' : '🎓 Student'}
            </p>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-number">
                  {user?.role === 'INSTRUCTOR' ? userCourses.length : completedCourses}
                </span>
                <span className="stat-label">
                  {user?.role === 'INSTRUCTOR' ? 'Courses Created' : 'Courses Completed'}
                </span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {user?.role === 'INSTRUCTOR' 
                    ? totalStudents
                    : inProgressCourses
                  }
                </span>
                <span className="stat-label">
                  {user?.role === 'INSTRUCTOR' ? 'Total Students' : 'In Progress'}
                </span>
              </div>
              {user?.role === 'INSTRUCTOR' && (
                <div className="stat">
                  <span className="stat-number">{averageRating?.toFixed(1) || '0.0'}</span>
                  <span className="stat-label">Avg Rating</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isEditing && (
          <div className="header-actions">
            <div className="edit-actions">
              <button 
                onClick={handleSaveProfile} 
                className="btn-primary save-btn"
                disabled={loadingStates.profile}
              >
                <Save size={18} />
                {loadingStates.profile ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={handleCancelEdit} 
                className="btn-secondary"
                disabled={loadingStates.profile}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2 className="section-title">Personal Information</h2>
          <div className="info-card">
            <div className="info-item">
              <label>Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="edit-input"
                  placeholder="Enter your full name"
                  disabled={loadingStates.profile}
                />
              ) : (
                <span>{user?.username || 'Not set'}</span>
              )}
            </div>
            
            <div className="info-item">
              <label>Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="edit-input"
                  placeholder="Enter your email"
                  disabled={loadingStates.profile}
                />
              ) : (
                <span>{user?.email}</span>
              )}
            </div>
            
            <div className="info-item">
              <label>Role</label>
              <span className="role-badge">{user?.role}</span>
            </div>

            <div className="info-item">
              <label>User ID</label>
              <span className="user-id">{user?.userId}</span>
            </div>
          </div>

          {!isChangingPassword && !isEditing && (
            <div className="action-section">
              <button 
                onClick={() => setIsChangingPassword(true)} 
                className="btn-primary change-password-btn"
              >
                Change Password
              </button>
            </div>
          )}

         {isChangingPassword && (
  <div className="password-modal">
    <div className="password-modal-content">
      <div className="password-modal-header">
        <h3>Change Password</h3>
        <button 
          onClick={handleCancelPasswordChange}
          className="password-modal-close"
          disabled={loadingStates.password}
        >
          ×
        </button>
      </div>
      
      <div className="password-form">
        <div className="password-input-group">
          <label>Current Password</label>
          <input
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
            className="password-input"
            placeholder="Enter current password"
            disabled={loadingStates.password}
          />
        </div>
        
        <div className="password-input-group">
          <label>New Password</label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
            className="password-input"
            placeholder="Enter new password"
            disabled={loadingStates.password}
          />
        </div>
        
        <div className="password-input-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
            className="password-input"
            placeholder="Confirm new password"
            disabled={loadingStates.password}
          />
        </div>

        {passwordError && (
          <div className="error-message">
            {passwordError}
          </div>
        )}

        <div className="password-modal-actions">
          <button 
            onClick={handleChangePassword} 
            className="password-modal-btn primary"
            disabled={loadingStates.password}
          >
            {loadingStates.password ? 'Updating...' : 'Update Password'}
          </button>
          <button 
            onClick={handleCancelPasswordChange} 
            className="password-modal-btn secondary"
            disabled={loadingStates.password}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}
        </div>

        <div className="profile-section">
          <h2 className="section-title">
            {user?.role === 'INSTRUCTOR' ? 'My Courses' : 'Learning Progress'}
          </h2>
          
          {user?.role === 'INSTRUCTOR' ? (
            <div className="courses-grid">
              {userCourses.slice(0, 4).map(course => (
                <div key={course.id} className="course-item">
                  <h4>{course.title}</h4>
                  <p className="course-meta">{course.category} • {course.level}</p>
                  <div className="course-stats">
                    <span>👥 {course.enrolledStudents || 0} students</span>
                    <span>⭐ {course.averageRating ? parseFloat(course.averageRating).toFixed(1) : '0.0'}</span>
                  </div>
                </div>
              ))}
              {userCourses.length === 0 && (
                <p className="empty-message">No courses created yet.</p>
              )}
            </div>
          ) : (
            <div className="progress-section">
              <div className="progress-stats">
                <div className="progress-item">
                  <div className="progress-circle">
                    <span className="progress-number">{completedCourses}</span>
                  </div>
                  <span className="progress-label">Completed</span>
                </div>
                <div className="progress-item">
                  <div className="progress-circle in-progress">
                    <span className="progress-number">{inProgressCourses}</span>
                  </div>
                  <span className="progress-label">In Progress</span>
                </div>
                <div className="progress-item">
                  <div className="progress-circle total">
                    <span className="progress-number">{enrollments.length}</span>
                  </div>
                  <span className="progress-label">Total Enrolled</span>
                </div>
              </div>
              
              {enrollments.length > 0 && (
                <div className="recent-activity">
                  <h4>Recent Activity</h4>
                  {enrollments.slice(0, 3).map(enrollment => (
                    <div key={enrollment.id} className="activity-item">
                      <span className="activity-course">{enrollment.courseTitle}</span>
                      <span className={`activity-status ${enrollment.completed ? 'completed' : 'in-progress'}`}>
                        {enrollment.completed ? '✅ Completed' : '⏳ In Progress'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="profile-section full-width">
        <h2 className="section-title">
          {user?.role === 'INSTRUCTOR' ? 'Teaching Statistics' : 'Learning Statistics'}
        </h2>
        <div className="stats-grid">
          {user?.role === 'INSTRUCTOR' ? (
            <>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-number">{userCourses.length}</div>
                  <div className="stat-label">Courses Created</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-number">{totalStudents}</div>
                  <div className="stat-label">Total Students</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <div className="stat-number">{averageRating?.toFixed(1) || '0.0'}</div>
                  <div className="stat-label">Average Rating</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <div className="stat-number">${totalRevenue.toFixed(2)}</div>
                  <div className="stat-label">Total Revenue</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <div className="stat-number">{completedCourses}</div>
                  <div className="stat-label">Courses Completed</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-content">
                  <div className="stat-number">{enrollments.length}</div>
                  <div className="stat-label">Total Enrolled</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏱️</div>
                <div className="stat-content">
                  <div className="stat-number">{inProgressCourses}</div>
                  <div className="stat-label">In Progress</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <div className="stat-number">
                    {enrollments.length > 0 ? Math.round((completedCourses / enrollments.length) * 100) : 0}%
                  </div>
                  <div className="stat-label">Completion Rate</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;