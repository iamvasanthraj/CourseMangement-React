import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useDashboard } from '../../../hooks/useDashboard';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { courses, enrollments, loading } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    expertise: user?.expertise || '',
  });

  // Filter data based on role
  const userCourses = user?.role === 'INSTRUCTOR' 
    ? courses.filter(course => course.instructorId === user?.userId)
    : enrollments;

  const completedCourses = enrollments.filter(e => e.completed).length;
  const inProgressCourses = enrollments.filter(e => !e.completed).length;
  const averageRating = user?.role === 'INSTRUCTOR' 
    ? courses.reduce((acc, course) => acc + (course.rating || 0), 0) / (courses.length || 1)
    : null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      expertise: user?.expertise || '',
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-state">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header Section */}
      <div className="profile-header">
        <div className="header-content">
          <div className="avatar-section">
            <div className="profile-avatar">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="avatar-badge">{user?.role}</div>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="edit-input"
                />
              ) : (
                user?.username
              )}
            </h1>
            <p className="profile-email">{user?.email}</p>
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
                    ? courses.reduce((acc, course) => acc + (course.enrolledStudents || 0), 0)
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
        
        <div className="header-actions">
          {isEditing ? (
            <div className="edit-actions">
              <button onClick={handleSaveProfile} className="btn-primary">Save Changes</button>
              <button onClick={handleCancelEdit} className="btn-secondary">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn-primary">Edit Profile</button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="profile-content">
        {/* Left Column - Personal Info */}
        <div className="profile-section">
          <h2 className="section-title">Personal Information</h2>
          <div className="info-card">
            <div className="info-item">
              <label>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{user?.email}</span>
              )}
            </div>
            
            <div className="info-item">
              <label>Role</label>
              <span className="role-badge">{user?.role}</span>
            </div>

            <div className="info-item full-width">
              <label>Bio</label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="edit-textarea"
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
              ) : (
                <p className="bio-text">
                  {user?.bio || 'No bio provided yet.'}
                </p>
              )}
            </div>

            {user?.role === 'INSTRUCTOR' && (
              <div className="info-item full-width">
                <label>Areas of Expertise</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.expertise}
                    onChange={(e) => handleInputChange('expertise', e.target.value)}
                    className="edit-input"
                    placeholder="e.g., Web Development, Data Science, UX Design"
                  />
                ) : (
                  <p>{user?.expertise || 'No expertise specified.'}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Role Specific Content */}
        <div className="profile-section">
          <h2 className="section-title">
            {user?.role === 'INSTRUCTOR' ? 'My Courses' : 'Learning Progress'}
          </h2>
          
          {user?.role === 'INSTRUCTOR' ? (
            /* Instructor Courses */
            <div className="courses-grid">
              {userCourses.slice(0, 4).map(course => (
                <div key={course.id} className="course-item">
                  <h4>{course.title}</h4>
                  <p className="course-meta">{course.category} • {course.level}</p>
                  <div className="course-stats">
                    <span>👥 {course.enrolledStudents || 0} students</span>
                    <span>⭐ {course.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              ))}
              {userCourses.length === 0 && (
                <p className="empty-message">No courses created yet.</p>
              )}
            </div>
          ) : (
            /* Student Progress */
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

      {/* Additional Sections */}
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
                  <div className="stat-number">
                    {courses.reduce((acc, course) => acc + (course.enrolledStudents || 0), 0)}
                  </div>
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
                  <div className="stat-number">
                    ${courses.reduce((acc, course) => acc + (course.price || 0), 0)}
                  </div>
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