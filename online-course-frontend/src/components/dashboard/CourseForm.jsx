import React from 'react';

const CourseForm = ({
  editingCourse,
  newCourse,
  loading,
  onUpdateCourse,
  onCreateCourse,
  onCancelEdit,
  onNewCourseChange,
  onEditingCourseChange
}) => {
  const categories = ['BACKEND', 'FRONTEND', 'CYBERSECURITY', 'DATABASE', 'MOBILE', 'DEVOPS'];
  const batches = ['New Batch', 'Ongoing', 'Completed'];

  const currentCourse = editingCourse || newCourse;
  const isEditing = !!editingCourse;

  const handleChange = (field, value) => {
    if (isEditing) {
      onEditingCourseChange({ ...editingCourse, [field]: value });
    } else {
      onNewCourseChange({ ...newCourse, [field]: value });
    }
  };

  const handleSubmit = (e) => {
    if (isEditing) {
      onUpdateCourse(e);
    } else {
      onCreateCourse(e);
    }
  };

  return (
    <div className="quantum-glass quantum-card quantum-bounce">
      <h2 className="quantum-text-gradient">🎯 {isEditing ? 'Edit Course' : 'Create New Course'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="quantum-form-group">
            <label htmlFor="course-title">Course Title</label>
            <input
              id="course-title"
              type="text"
              className="quantum-input"
              placeholder="Course Title"
              value={currentCourse.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>
          <div className="quantum-form-group">
            <label htmlFor="course-category">Category</label>
            <select
              id="course-category"
              className="quantum-input"
              value={currentCourse.category}
              onChange={(e) => handleChange('category', e.target.value)}
              required
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="quantum-form-group">
            <label htmlFor="course-price">Price ($)</label>
            <input
              id="course-price"
              type="number"
              className="quantum-input"
              placeholder="Price ($)"
              step="0.01"
              min="0"
              value={currentCourse.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              required
            />
          </div>
          <div className="quantum-form-group">
            <label htmlFor="course-batch">Batch</label>
            <select
              id="course-batch"
              className="quantum-input"
              value={currentCourse.batch}
              onChange={(e) => handleChange('batch', e.target.value)}
            >
              {batches.map(batch => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="quantum-form-group">
          <label htmlFor="course-description">Course Description</label>
          <textarea
            id="course-description"
            className="quantum-input"
            placeholder="Course Description"
            value={currentCourse.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows="4"
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="quantum-btn" disabled={loading}>
            {loading ? '⏳' : isEditing ? '💾 Update Course' : '🚀 Create Course'}
          </button>
          {isEditing && (
            <button 
              type="button" 
              className="quantum-btn quantum-btn-secondary"
              onClick={onCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CourseForm;