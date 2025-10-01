// components/dashboard/student/StudentDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../../dashboard/student/CourseCard';
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

  const enrolledCourseIds = enrollments?.map(enrollment => enrollment.courseId) || [];
  const availableCourses = courses?.filter(course => !enrolledCourseIds.includes(course.id)) || [];
  const filteredCourses = filter === 'ALL' 
    ? availableCourses 
    : availableCourses.filter(course => course.category === filter);

  const handleEnrollWithMessage = async (courseId) => {
    try {
      await handleEnroll(courseId);
      const course = courses?.find(c => c.id === courseId);
      if (course) {
        showMessage('success', `🎉 Successfully enrolled in "${course.title}"!`);
      } else {
        showMessage('success', '🎉 Successfully enrolled in the course!');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      showMessage('error', 'Failed to enroll in the course. Please try again.');
    }
  };

  // Calculate overall rating stats
  const totalRatings = availableCourses.reduce((sum, course) => sum + (course.totalRatings || 0), 0);
  const averageRating = availableCourses.length > 0 
    ? (availableCourses.reduce((sum, course) => {
        const rating = course.averageRating || 0;
        return sum + (typeof rating === 'number' ? rating : parseFloat(rating) || 0);
      }, 0) / availableCourses.length).toFixed(1)
    : '0.0';

  return (
    <div className="student-dashboard-container">
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
              {categories?.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="rating-stats">
            <div className="rating-stat">
              <span className="stat-label">Avg. Course Rating:</span>
              <span className="stat-value">{averageRating} ⭐</span>
            </div>
            <div className="rating-stat">
              <span className="stat-label">Total Ratings:</span>
              <span className="stat-value">{totalRatings}</span>
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-state">
          <div className="quantum-loading">Loading courses...</div>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses?.map(course => {
            const courseAverageRating = course.averageRating !== undefined 
              ? (typeof course.averageRating === 'number' 
                  ? course.averageRating 
                  : parseFloat(course.averageRating) || 0)
              : 0;
            
            const courseTotalRatings = course.totalRatings || 0;
            const enrolledStudents = course.enrolledStudents || 0;

            return (
              <CourseCard 
                key={course.id}
                course={course}
                user={user}
                isEnrolled={false}
                onEnroll={handleEnrollWithMessage}
                loading={enrollingCourseId === course.id}
                showEnrollButton={true}
                enrollmentData={{
                  courseAverageRating: courseAverageRating,
                  courseTotalRatings: courseTotalRatings,
                  enrolledStudents: enrolledStudents,
                  instructorName: course.instructorName,
                  duration: course.duration,
                  level: course.level,
                  batch: course.batch,
                  courseDescription: course.description,
                  courseTitle: course.title,
                  courseCategory: course.category,
                  completed: false,
                  enrollmentDate: null,
                  testScore: 0,
                  totalQuestions: 10,
                  percentage: 0
                }}
                showPrice={true} // Show price in student dashboard
              />
            );
          })}
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