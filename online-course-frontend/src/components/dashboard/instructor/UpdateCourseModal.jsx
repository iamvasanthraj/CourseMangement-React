// components/dashboard/instructor/UpdateCourseModal.jsx - Remove description field
import React, { useState, useEffect } from 'react';
import './UpdateCourseModal.css';

const UpdateCourseModal = ({ course, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    category: 'BACKEND',
    price: 0,
    level: 'BEGINNER',
    batch: ''
  });

  const categories = ['BACKEND', 'FRONTEND', 'CYBERSECURITY', 'DATABASE', 'MOBILE', 'DEVOPS'];
  const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  const durations = ['4 weeks', '6 weeks', '8 weeks', '12 weeks', '16 weeks', '24 weeks', '3 months', '6 months', '1 year'];
  const batches = ['Spring 2024', 'Summer 2024', 'Fall 2024', 'Winter 2024', 'January Batch', 'June Batch', 'New Batch'];

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        duration: course.duration || '',
        category: course.category || 'BACKEND',
        price: course.price || 0,
        level: course.level || 'BEGINNER',
        batch: course.batch || ''
      });
    }
  }, [course]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Course title is required');
      return;
    }
    
    if (!formData.duration.trim()) {
      alert('Course duration is required');
      return;
    }

    console.log('📝 Submitting update data:', formData);
    onSubmit(formData);
  };

  return (
    <div className="update-modal-overlay">
      <div className="update-modal-container">
        <div className="update-modal-glass">
          <div className="modal-header">
            <h2>Update Course</h2>
            <button className="close-btn" onClick={onCancel}>×</button>
          </div>

          <form onSubmit={handleSubmit} className="update-form">
            <div className="form-grid">
              {/* Course Title */}
              <div className="form-group full-width">
                <label>Course Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter course title"
                  required
                  disabled={loading}
                />
              </div>

              {/* Duration */}
              <div className="form-group">
                <label>Duration *</label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
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
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  disabled={loading}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>

              {/* Level */}
              <div className="form-group">
                <label>Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => handleChange('level', e.target.value)}
                  disabled={loading}
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Batch */}
              <div className="form-group">
                <label>Batch</label>
                <select
                  value={formData.batch}
                  onChange={(e) => handleChange('batch', e.target.value)}
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
                type="button" 
                onClick={onCancel} 
                disabled={loading}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || !formData.title || !formData.duration}
                className="submit-btn"
              >
                {loading ? 'Updating...' : 'Update Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateCourseModal;