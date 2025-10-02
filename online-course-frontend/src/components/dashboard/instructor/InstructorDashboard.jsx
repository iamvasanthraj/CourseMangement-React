// components/dashboard/instructor/InstructorDashboard.jsx
import React from 'react';
import CourseForm from './CourseForm';
import { useDashboard } from '../../../hooks/useDashboard';

const InstructorDashboard = () => {
  const {
    newCourse,
    setNewCourse,
    handleCreateCourse,
    loading
  } = useDashboard();

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2 className="section-title">➕ Create New Course</h2>
        {/* <p className="section-subtitle">Fill in the details to create a new course for students</p> */}
      </div>
      
      <CourseForm 
        newCourse={newCourse}
        setNewCourse={setNewCourse}
        onSubmit={handleCreateCourse}
        loading={loading}
      />
    </div>
  );
};

export default InstructorDashboard;