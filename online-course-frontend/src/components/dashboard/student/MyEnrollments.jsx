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
    showMessage,
    handleViewCertificate
  } = useDashboard();

  // ✅ ADD: Debug what enrollments data actually contains
  React.useEffect(() => {
    if (enrollments.length > 0) {
      console.log('🔍 ENROLLMENTS DATA FROM API:', enrollments);
      enrollments.forEach((enrollment, index) => {
        console.log(`📊 Enrollment ${index} - ${enrollment.courseTitle}:`, {
          courseAverageRating: enrollment.courseAverageRating,
          courseTotalRatings: enrollment.courseTotalRatings,
          averageRating: enrollment.averageRating,
          totalRatings: enrollment.totalRatings,
          rating: enrollment.rating,
          // Check all possible rating fields
          allKeys: Object.keys(enrollment)
        });
      });
    }
  }, [enrollments]);

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
        onViewCertificate={handleViewCertificate}
        showMessage={showMessage}
      />
    </div>
  );
};

export default MyEnrollments;