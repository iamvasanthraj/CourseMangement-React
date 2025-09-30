// components/dashboard/student/StudentDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from './CourseCard';
import { useDashboard } from '../../../hooks/useDashboard';
import './StudentDashboard.css';

const StudentDashboard = ({ filter, setFilter, categories }) => {
  const {
    user,
    courses,
    enrollments,
    loading,
    enrollingCourseId,
    handleEnroll,
    showMessage
  } = useDashboard();

  const navigate = useNavigate();

  const enrolledCourseIds = enrollments.map(enrollment => enrollment.courseId);
  
  // Only show courses that are NOT enrolled
  const availableCourses = courses.filter(course => !enrolledCourseIds.includes(course.id));
  
  const filteredCourses = filter === 'ALL' 
    ? availableCourses 
    : availableCourses.filter(course => course.category === filter);

  // Enhanced enroll handler with success message
  const handleEnrollWithMessage = async (courseId) => {
    try {
      await handleEnroll(courseId);
      const course = courses.find(c => c.id === courseId);
      if (course) {
        showMessage('success', `🎉 Successfully enrolled in "${course.title}"! Check "My Enrollments" to track your progress.`);
      } else {
        showMessage('success', '🎉 Successfully enrolled in the course!');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
    }
  };

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2 className="section-title">📚 Available Courses</h2>
        <div className="section-controls">
          <div className="filter-group">
            <label htmlFor="category-filter" className="filter-label">Filter by category:</label>
            <select 
              id="category-filter" 
              className="filter-select"
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-state">
          <div className="quantum-loading">Loading courses...</div>
        </div>
      ) : (
        <div className="courses-grid"> {/* This will now show 2 cards per row */}
          {filteredCourses.map(course => (
            <CourseCard 
              key={course.id}
              course={course}
              user={user}
              isEnrolled={false}
              onEnroll={handleEnrollWithMessage}
              loading={enrollingCourseId === course.id}
              showEnrollButton={true}
            />
          ))}
        </div>
      )}
      
      {filteredCourses.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">
            {enrolledCourseIds.length > 0 ? '🎓' : '📚'}
          </div>
          <h3>
            {enrolledCourseIds.length > 0 
              ? "You've enrolled in all available courses!" 
              : "No courses available"
            }
          </h3>
          <p>
            {enrolledCourseIds.length > 0 
              ? "Great job! You're enrolled in all our courses. Check your enrollments to track your learning progress."
              : "There are currently no courses available. Please check back later."
            }
          </p>
          <div className="empty-state-actions">
            {enrolledCourseIds.length > 0 && (
              <button 
                onClick={() => navigate('/my-enrollments')}
                className="action-btn primary-btn"
              >
                🎓 View My Enrollments
              </button>
            )}
            {filter !== 'ALL' && (
              <button 
                onClick={() => setFilter('ALL')}
                className="action-btn secondary-btn"
              >
                🔄 Show All Categories
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;