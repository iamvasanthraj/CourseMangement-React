import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { enrollmentAPI, coursesAPI } from '../../services/api';
import './EnrollmentsPage.css';

const EnrollmentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('ALL');

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  }, []);

  const loadEnrollments = useCallback(async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const response = await enrollmentAPI.getStudentEnrollments(user.userId);
      
      const enrollmentsData = Array.isArray(response?.data) ? response.data : 
                             Array.isArray(response) ? response : [];
      
      const enrollmentsWithCourses = await Promise.all(
        enrollmentsData.map(async (enrollment) => {
          if (!enrollment?.courseId) return null;

          try {
            const courseResponse = await coursesAPI.getById(enrollment.courseId);
            const courseData = courseResponse?.data || courseResponse;
            
            return {
              ...enrollment,
              course: courseData,
              enrollmentId: enrollment.enrollmentId || enrollment.id,
              completed: enrollment.completed || false,
              completionDate: enrollment.completionDate || null,
              studentName: user.username,
              studentId: user.userId
            };
          } catch (error) {
            console.error('Error loading course details:', error);
            return {
              ...enrollment,
              course: { 
                id: enrollment.courseId, 
                title: 'Course not available',
                category: 'Unknown',
                instructorName: 'Instructor not available',
                price: 0
              },
              enrollmentId: enrollment.enrollmentId || enrollment.id,
              completed: enrollment.completed || false,
              completionDate: enrollment.completionDate || null,
              studentName: user.username,
              studentId: user.userId
            };
          }
        })
      );
      
      setEnrollments(enrollmentsWithCourses.filter(Boolean));
    } catch (error) {
      console.error('Error loading enrollments:', error);
      showMessage('error', 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }, [user?.userId, user?.username, showMessage]);

  const handleUnenroll = async (enrollmentId) => {
    if (!enrollmentId) {
      showMessage('error', 'Invalid enrollment ID');
      return;
    }

    try {
      setLoading(true);
      await enrollmentAPI.unenroll(enrollmentId);
      showMessage('success', 'Unenrolled successfully!');
      await loadEnrollments();
    } catch (error) {
      console.error('Unenroll error:', error);
      showMessage('error', error.response?.data?.message || 'Failed to unenroll');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (enrollment) => {
    navigate('/test', {
      state: {
        enrollmentId: enrollment.enrollmentId,
        courseId: enrollment.courseId,
        courseTitle: enrollment.course?.title,
        studentId: user.userId,
        studentName: user.username
      }
    });
  };

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  const filteredEnrollments = enrollments.filter(enrollment => {
    switch (filter) {
      case 'COMPLETED':
        return enrollment.completed;
      case 'IN_PROGRESS':
        return !enrollment.completed;
      default:
        return true;
    }
  });

  if (!user) {
    return (
      <div className="enrollments-page">
        <div className="enrollments-container">
          <div className="quantum-loading">Please log in to view your enrollments.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="enrollments-page">
      <div className="enrollments-container">
        <header className="enrollments-header">
          <div className="header-content">
            <h1 className="page-title">🎓 My Enrollments</h1>
            <p className="page-subtitle">Manage your course enrollments and track your progress</p>
          </div>
          
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-number">{enrollments.length}</span>
              <span className="stat-label">Total Courses</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {enrollments.filter(e => e.completed).length}
              </span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {enrollments.filter(e => !e.completed).length}
              </span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>
        </header>

        {message.text && (
          <div className={`quantum-message quantum-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="enrollments-controls">
          <div className="filter-section">
            <label htmlFor="enrollment-filter" className="filter-label">
              Filter by status:
            </label>
            <select 
              id="enrollment-filter"
              className="filter-select"
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All Enrollments</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <span className="results-count">
              {filteredEnrollments.length} of {enrollments.length} courses
            </span>
          </div>
        </div>

        {loading ? (
          <div className="loading-section">
            <div className="quantum-loading">Loading your enrollments...</div>
          </div>
        ) : (
          <div className="enrollments-grid">
            {filteredEnrollments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No enrollments found</h3>
                <p>
                  {filter === 'COMPLETED' 
                    ? "You haven't completed any courses yet."
                    : filter === 'IN_PROGRESS'
                    ? "You don't have any courses in progress."
                    : "You haven't enrolled in any courses yet."
                  }
                </p>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="quantum-btn quantum-btn-primary"
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              filteredEnrollments.map(enrollment => (
                <div key={enrollment.enrollmentId} className="enrollment-card quantum-glass">
                  <div className="card-header">
                    <div className="course-info">
                      <h3 className="course-title">{enrollment.course.title}</h3>
                      <span className="course-category">{enrollment.course.category}</span>
                    </div>
                    <div className={`status-badge ${enrollment.completed ? 'completed' : 'in-progress'}`}>
                      {enrollment.completed ? '✅ Completed' : '📚 In Progress'}
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="course-details">
                      <div className="detail-item">
                        <span className="detail-label">Instructor:</span>
                        <span className="detail-value">{enrollment.course.instructorName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Enrolled:</span>
                        <span className="detail-value">
                          {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                        </span>
                      </div>
                      {enrollment.completionDate && (
                        <div className="detail-item">
                          <span className="detail-label">Completed:</span>
                          <span className="detail-value">
                            {new Date(enrollment.completionDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="progress-section">
                      {enrollment.completed ? (
                        <div className="completion-message">
                          🎉 Congratulations! You've completed this course.
                        </div>
                      ) : (
                        <div className="progress-message">
                          ⏳ Continue learning to complete the course.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card-actions">
                    {!enrollment.completed && (
                      <button
                        onClick={() => handleStartTest(enrollment)}
                        className="action-btn test-btn"
                        disabled={loading}
                      >
                        🧪 Take Test
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleUnenroll(enrollment.enrollmentId)}
                      className="action-btn unenroll-btn"
                      disabled={loading}
                    >
                      {loading ? '⏳' : '❌ Unenroll'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentsPage;