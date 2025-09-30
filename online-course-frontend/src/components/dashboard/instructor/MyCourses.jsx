// components/dashboard/instructor/MyCourses.jsx - Update the component
import React from 'react';
import { useDashboard } from '../../../hooks/useDashboard';
import InstructorCourseCard from './InstructorCourseCard';
import './MyCourses.css';

const MyCourses = () => {
  const {
    courses,
    loading,
    user,
    handleDeleteCourse,
    handleUpdateCourse,
    showMessage
  } = useDashboard();

  // Filter courses created by this instructor
  const instructorCourses = courses.filter(course => 
    course.instructorId === user?.userId || course.instructorName === user?.username
  );

  if (loading) {
    return (
      <div className="my-courses-page">
        <div className="loading-state">
          <div className="quantum-loading">Loading your courses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-courses-page">
      <header className="page-header">
        <h1 className="page-title">📚 My Courses</h1>
        <p className="page-subtitle">Manage and track your created courses</p>
        
        {/* Instructor Stats */}
        <div className="instructor-stats-grid">
          <div className="stat-card quantum-glass">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <div className="stat-number">{instructorCourses.length}</div>
              <div className="stat-label">Total Courses</div>
            </div>
          </div>
          <div className="stat-card quantum-glass">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-number">
                {instructorCourses.reduce((total, course) => total + (course.enrolledStudents || 0), 0)}
              </div>
              <div className="stat-label">Total Students</div>
            </div>
          </div>
          <div className="stat-card quantum-glass">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-number">
                {instructorCourses.length > 0 
                  ? (instructorCourses.reduce((total, course) => total + (course.rating || 0), 0) / instructorCourses.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
          <div className="stat-card quantum-glass">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-number">
                ${instructorCourses.reduce((total, course) => total + (course.price || 0), 0)}
              </div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
        </div>
      </header>

      {instructorCourses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No Courses Created Yet</h3>
          <p>You haven't created any courses yet. Start by creating your first course from the dashboard!</p>
        </div>
      ) : (
        <div className="instructor-courses-grid">
          {instructorCourses.map(course => (
            <InstructorCourseCard 
              key={course.id}
              course={course}
              onDelete={handleDeleteCourse}
              onUpdate={handleUpdateCourse}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;