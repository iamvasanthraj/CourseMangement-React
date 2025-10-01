import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { coursesAPI, enrollmentAPI } from '../../../services/api';
// ✅ FIXED: Import CourseCard from correct location
import CourseCard from '../../shared/CourseCard';
import EnrollmentsModal from '../instructor/EnrollmentsModal';
import RatingModal from '../../shared/RatingModal';
import './EnrollmentsPage.css';

const EnrollmentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('ALL');
  const [selectedCourseEnrollments, setSelectedCourseEnrollments] = useState([]);
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [rating, setRating] = useState({ stars: 5, comment: '' });

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  }, []);

  // ✅ FIXED: Updated loadData function with better error handling
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (user?.role === 'INSTRUCTOR') {
        const response = await coursesAPI.getAll();
        console.log('👨‍🏫 Instructor courses response:', response);
        
        const coursesData = Array.isArray(response) ? response : 
                           Array.isArray(response?.data) ? response.data : [];
        
        const instructorCourses = coursesData.filter(course => 
          course.instructorId === user?.userId
        );
        
        setData(instructorCourses);
      } else if (user?.role === 'STUDENT') {
        // ✅ FIXED: Use the improved enrollment API directly
        const enrollmentsData = await enrollmentAPI.getStudentEnrollments(user.userId);
        console.log('🎓 Processed enrollments data:', enrollmentsData);
        
        // ✅ FIXED: Use enrollment data directly without additional course API calls
        const processedEnrollments = enrollmentsData.map(enrollment => {
          // ✅ FIXED: Create proper enrollment data structure for CourseCard
          return {
            ...enrollment,
            enrollmentId: enrollment.enrollmentId || enrollment.id,
            completed: enrollment.completed || false,
            studentName: user.username,
            studentId: user.userId,
            // ✅ ADD: Ensure all required fields for CourseCard are present
            course: {
              id: enrollment.courseId,
              title: enrollment.courseTitle,
              category: enrollment.courseCategory,
              instructorName: enrollment.instructorName,
              duration: enrollment.duration,
              level: enrollment.level,
              price: enrollment.price,
              description: enrollment.courseDescription || `Master ${enrollment.courseTitle} through comprehensive lessons.`
            }
          };
        });
        
        console.log('✅ Final processed enrollments:', processedEnrollments);
        setData(processedEnrollments);
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      showMessage('error', `Failed to load ${user?.role === 'INSTRUCTOR' ? 'courses' : 'enrollments'}`);
      setData([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [user, showMessage]);

  // Course management for instructors
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      setLoading(true);
      await coursesAPI.delete(courseId);
      showMessage('success', 'Course deleted successfully!');
      await loadData();
    } catch (error) {
      console.error('Delete course error:', error);
      showMessage('error', 'Failed to delete course');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    navigate('/dashboard');
  };

  // Enrollment management for instructors
  const loadCourseEnrollments = async (courseId) => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getCourseEnrollments(courseId);
      const enrollmentsData = Array.isArray(response?.data) ? response.data : [];
      
      const enrollmentsWithStudents = enrollmentsData.map((enrollment) => {
        return {
          enrollmentId: enrollment.enrollmentId || enrollment.id,
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
          studentName: enrollment.studentName || `Student #${enrollment.studentId}`,
          enrollmentDate: enrollment.enrollmentDate,
          completed: enrollment.completed || false,
          completionDate: enrollment.completionDate
        };
      });
      
      setSelectedCourseEnrollments(enrollmentsWithStudents);
      setShowEnrollmentsModal(true);
    } catch (error) {
      console.error('Error loading enrollments:', error);
      showMessage('error', 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (enrollmentId) => {
    try {
      setLoading(true);
      await enrollmentAPI.markComplete(enrollmentId);
      showMessage('success', 'Enrollment marked as completed!');
      
      if (selectedCourseEnrollments.length > 0) {
        const courseId = selectedCourseEnrollments[0].courseId;
        await loadCourseEnrollments(courseId);
      }
    } catch (error) {
      console.error('Mark complete error:', error);
      showMessage('error', 'Failed to mark as complete');
    } finally {
      setLoading(false);
    }
  };

  // Student enrollment actions
  const handleUnenroll = async (unenrollData) => {
    try {
      setLoading(true);
      const { enrollmentId, courseId } = unenrollData;
      
      if (enrollmentId) {
        await enrollmentAPI.unenroll(enrollmentId);
      } else if (courseId && user?.userId) {
        // Find enrollment by courseId and userId
        const enrollmentToDelete = data.find(e => 
          e.courseId === courseId && e.studentId === user.userId
        );
        if (enrollmentToDelete?.enrollmentId) {
          await enrollmentAPI.unenroll(enrollmentToDelete.enrollmentId);
        }
      }
      
      showMessage('success', 'Unenrolled successfully!');
      await loadData();
    } catch (error) {
      console.error('Unenroll error:', error);
      showMessage('error', 'Failed to unenroll');
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

  // ✅ FIXED: Add handleRate function for CourseCard
  const handleRate = async (courseId, ratingValue, ratingData = {}) => {
    try {
      // Find the enrollment for this course
      const enrollment = data.find(e => e.courseId === courseId);
      if (!enrollment?.enrollmentId) {
        throw new Error('Enrollment not found for rating');
      }

      // Use the completeCourse API to submit rating
      await enrollmentAPI.completeCourse(enrollment.enrollmentId, {
        rating: ratingValue,
        feedback: ratingData.feedback || 'Rated by student',
        completed: true
      });

      showMessage('success', '⭐ Rating submitted successfully!');
      await loadData(); // Refresh data to show updated rating
    } catch (error) {
      console.error('Rating error:', error);
      showMessage('error', 'Failed to submit rating');
      throw error;
    }
  };

  const handleGenerateCertificate = (enrollment) => {
    showMessage('info', 'Certificate generation feature coming soon!');
  };

  // For student enrollments - dummy enroll function
  const handleEnroll = async (courseId) => {
    console.log('Enroll function called for course:', courseId);
  };

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  // Filter data
  const filteredData = data.filter(item => {
    if (user?.role === 'INSTRUCTOR') {
      switch (filter) {
        case 'ACTIVE': return item.isActive;
        case 'INACTIVE': return !item.isActive;
        default: return true;
      }
    } else {
      switch (filter) {
        case 'COMPLETED': return item.completed;
        case 'IN_PROGRESS': return !item.completed;
        default: return true;
      }
    }
  });

  if (!user) {
    return (
      <div className="enrollments-page">
        <div className="enrollments-container">
          <div className="quantum-loading">Please log in to view this page.</div>
        </div>
      </div>
    );
  }

  const isInstructor = user.role === 'INSTRUCTOR';

  return (
    <div className="enrollments-page">
      <div className="enrollments-container">
        <header className="enrollments-header">
          <div className="header-content">
            <h1 className="page-title">
              {isInstructor ? '📚 My Courses' : '🎓 My Enrollments'}
            </h1>
            <p className="page-subtitle">
              {isInstructor ? 'Manage your courses and track student enrollment' : 'Track your learning progress and course completions'}
            </p>
          </div>
        </header>

        {message.text && (
          <div className={`quantum-message quantum-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="enrollments-controls">
          <div className="filter-section">
            <label htmlFor="data-filter" className="filter-label">
              Filter by status:
            </label>
            <select 
              id="data-filter"
              className="filter-select"
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
            >
              {isInstructor ? (
                <>
                  <option value="ALL">All Courses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </>
              ) : (
                <>
                  <option value="ALL">All Enrollments</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </>
              )}
            </select>
          </div>
          
          {isInstructor && (
            <button 
              onClick={handleCreateCourse}
              className="quantum-btn quantum-btn-primary"
            >
              ➕ Create New Course
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-section">
            <div className="quantum-loading">Loading {isInstructor ? 'courses' : 'enrollments'}...</div>
          </div>
        ) : (
          <div className="enrollments-grid">
            {filteredData.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">{isInstructor ? '📚' : '🎓'}</div>
                <h3>No {isInstructor ? 'courses' : 'enrollments'} found</h3>
                <p>
                  {isInstructor ? (
                    "You haven't created any courses yet."
                  ) : (
                    "You haven't enrolled in any courses yet."
                  )}
                </p>
                {isInstructor ? (
                  <button 
                    onClick={handleCreateCourse}
                    className="quantum-btn quantum-btn-primary"
                  >
                    Create Your First Course
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="quantum-btn quantum-btn-primary"
                  >
                    Browse Available Courses
                  </button>
                )}
              </div>
            ) : isInstructor ? (
              // Instructor courses view
              filteredData.map(course => (
                <div key={course.id} className="enrollment-card quantum-glass">
                  <div className="card-header">
                    <div className="course-info">
                      <h3 className="course-title">{course.title}</h3>
                      <span className="course-category">{course.category}</span>
                    </div>
                    <div className={`status-badge ${course.isActive ? 'active' : 'inactive'}`}>
                      {course.isActive ? '🟢 Active' : '🔴 Inactive'}
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="course-details">
                      <div className="detail-item">
                        <span className="detail-label">Instructor:</span>
                        <span className="detail-value">{course.instructorName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Price:</span>
                        <span className="detail-value">${course.price || '0.00'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Students Enrolled:</span>
                        <span className="detail-value highlight">{course.enrolledStudents || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      onClick={() => loadCourseEnrollments(course.id)}
                      className="action-btn analytics-btn"
                    >
                      👥 View Enrollments
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="action-btn delete-btn"
                      disabled={loading}
                    >
                      {loading ? '⏳' : '🗑️ Delete'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Student enrollments view
              filteredData.map(enrollment => (
                <CourseCard 
                  key={enrollment.enrollmentId}
                  course={enrollment.course}
                  user={user}
                  isEnrolled={true}
                  onEnroll={handleEnroll}
                  onRate={handleRate}
                  onUnenroll={handleUnenroll}
                  onStartTest={() => handleStartTest(enrollment)}
                  loading={loading}
                  showEnrollButton={false}
                  // ✅ ADD: Pass enrollment data with rating information
                  enrollmentData={{
                    ...enrollment,
                    courseAverageRating: enrollment.courseAverageRating,
                    courseTotalRatings: enrollment.courseTotalRatings,
                    enrolledStudents: enrollment.enrolledStudents,
                    instructorName: enrollment.instructorName,
                    duration: enrollment.duration,
                    level: enrollment.level
                  }}
                />
              ))
            )}
          </div>
        )}

        {/* Enrollments Modal for Instructors */}
        {showEnrollmentsModal && isInstructor && (
          <EnrollmentsModal
            enrollments={selectedCourseEnrollments}
            loading={loading}
            onMarkComplete={handleMarkComplete}
            onGenerateCertificate={handleGenerateCertificate}
            onClose={() => setShowEnrollmentsModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default EnrollmentsPage;