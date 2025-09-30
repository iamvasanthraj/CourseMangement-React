// components/enrollments/MyEnrollments.jsx
import React from 'react';
import { useDashboard } from '../../../hooks/useDashboard';
import EnrollmentsSection from './EnrollmentsSection';
import './MyEnrollments.css';

const MyEnrollments = () => {
  const {
    enrollments,
    loading,
    handleUnenroll,
    handleRate,
    user,
    handleStartTest,
    showMessage
  } = useDashboard();

  return (
    <div className="my-enrollments-page">
      <header className="page-header">
        <h1 className="page-title">🎓 My Enrollments</h1>
        <p className="page-subtitle">Track your learning progress and manage your courses</p>
      </header>

      <EnrollmentsSection
        enrollments={enrollments}
        loading={loading}
        onUnenroll={handleUnenroll}
        onRate={handleRate}
        user={user}
        onStartTest={handleStartTest}
        showMessage={showMessage}
      />
    </div>
  );
};

export default MyEnrollments;