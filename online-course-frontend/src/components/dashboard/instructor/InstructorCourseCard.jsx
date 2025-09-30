// components/dashboard/instructor/InstructorCourseCard.jsx
import React, { useState } from 'react';
import './InstructorCourseCard.css';
import UpdateCourseModal from './UpdateCourseModal';

const InstructorCourseCard = ({ 
  course, 
  onDelete, 
  onUpdate,
  loading = false 
}) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const averageRating = course?.rating || 0;
  const totalRatings = course?.totalRatings || 0;
  const enrolledStudents = course?.enrolledStudents || 0;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(course.id, course.title);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleUpdateClick = () => {
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = (updatedData) => {
    onUpdate(course.id, updatedData);
    setShowUpdateModal(false);
  };

  const handleUpdateCancel = () => {
    setShowUpdateModal(false);
  };

  return (
    <>
      <div className="instructor-course-card quantum-glass">
        <div className="card-header">
          <div className="course-badge">{course.category}</div>
          <div className="course-price">${course.price || 0}</div>
        </div>

        <div className="card-content">
          <h3 className="course-title">{course.title}</h3>
          <p className="course-description">{course.description}</p>

          <div className="course-meta">
            <div className="meta-item">
              <span className="meta-icon">👨‍🏫</span>
              {course.instructorName}
            </div>
            <div className="meta-item">
              <span className="meta-icon">👥</span>
              {enrolledStudents} students
            </div>
            {course.batch && (
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                {course.batch}
              </div>
            )}
          </div>

          <div className="course-stats">
            <div className="stat">
              <span className="stat-value">{averageRating.toFixed(1)} ({totalRatings})</span>
              <span className="stat-label">Rating</span>
            </div>
            <div className="stat">
              <span className="stat-value">{course.duration || '8 weeks'}</span>
              <span className="stat-label">Duration</span>
            </div>
            <div className="stat">
              <span className="stat-value">{course.level || 'Beginner'}</span>
              <span className="stat-label">Level</span>
            </div>
          </div>
        </div>
        
        <div className="card-actions">
          <div className="instructor-actions">
            <button 
              onClick={handleUpdateClick}
              className="action-btn update-btn"
              disabled={loading}
            >
              ✏️ Update
            </button>
            <button 
              onClick={handleDeleteClick}
              className="action-btn delete-btn"
              disabled={loading}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* Update Course Modal */}
      {showUpdateModal && (
        <UpdateCourseModal
          course={course}
          onSubmit={handleUpdateSubmit}
          onCancel={handleUpdateCancel}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-content">
              <div className="warning-icon">⚠️</div>
              <p>Are you sure you want to delete <strong>"{course.title}"</strong>?</p>
              <p className="warning-text">This action cannot be undone and will remove all course data.</p>
            </div>
            <div className="modal-actions">
              <button 
                onClick={handleCancelDelete}
                className="cancel-btn"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="confirm-delete-btn"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstructorCourseCard;