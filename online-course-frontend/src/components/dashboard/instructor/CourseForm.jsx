import React from 'react';
import './CourseForm.css';

const CourseForm = ({ 
  newCourse, 
  setNewCourse, 
  onSubmit, 
  loading = false 
}) => {
  const categories = ['BACKEND', 'FRONTEND', 'CYBERSECURITY', 'DATABASE', 'MOBILE', 'DEVOPS'];
  const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  const durations = ['4 weeks', '6 weeks', '8 weeks', '12 weeks', '16 weeks', '24 weeks', '3 months', '6 months', '1 year'];
  const batches = ['Spring 2024', 'Summer 2024', 'Fall 2024', 'Winter 2024', 'January Batch', 'June Batch', 'New Batch'];

  // Safe default values to prevent undefined errors
  const safeNewCourse = newCourse || {
    title: '',
    duration: '',
    category: 'BACKEND',
    price: 0,
    level: 'BEGINNER',
    batch: 'New Batch'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  const handleInputChange = (field, value) => {
    setNewCourse(prev => ({
      ...(prev || {}), // Handle case where prev might be undefined
      [field]: value
    }));
  };

  return (
    <div className="course-form-container">
      <form onSubmit={handleSubmit} className="quantum-form">
        <div className="form-grid">
          {/* Course Title */}
          <div className="form-group">
            <label className="form-label">Course Title *</label>
            <input
              type="text"
              className="form-input"
              value={safeNewCourse.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter course title"
              required
              disabled={loading}
            />
          </div>

          {/* Duration */}
          <div className="form-group">
            <label className="form-label">Duration *</label>
            <select
              className="form-select"
              value={safeNewCourse.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select duration</option>
              {durations.map(duration => (
                <option key={duration} value={duration}>{duration}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={safeNewCourse.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Level */}
          <div className="form-group">
            <label className="form-label">Difficulty Level *</label>
            <select
              className="form-select"
              value={safeNewCourse.level}
              onChange={(e) => handleInputChange('level', e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select level</option>
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div className="form-group">
            <label className="form-label">Price ($)</label>
            <input
              type="number"
              className="form-input no-spinner"
              value={safeNewCourse.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>

          {/* Batch */}
          <div className="form-group">
            <label className="form-label">Batch Name</label>
            <select
              className="form-select"
              value={safeNewCourse.batch}
              onChange={(e) => handleInputChange('batch', e.target.value)}
              disabled={loading}
            >
              <option value="">Select batch</option>
              {batches.map(batch => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn primary-btn"
            disabled={loading || !safeNewCourse.title || !safeNewCourse.duration}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creating...
              </>
            ) : (
              'Create Course'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;