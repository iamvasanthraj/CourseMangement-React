// hooks/useDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { coursesAPI, enrollmentAPI, testAPI, certificateAPI } from '../services/api';

export const useDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  }, []);

  // Load available courses for students
  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const coursesData = await coursesAPI.getAll();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
      showMessage('error', 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  // Load student enrollments
  const loadEnrollments = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const enrollmentsData = await enrollmentAPI.getStudentEnrollments(user.userId);
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error loading enrollments:', error);
      showMessage('error', 'Failed to load enrollments');
    }
  }, [user?.userId, showMessage]);

  // Refresh functions for unenrollment
  const refreshEnrollments = useCallback(async () => {
    await loadEnrollments();
  }, [loadEnrollments]);

  const refreshCourses = useCallback(async () => {
    await loadCourses();
  }, [loadCourses]);

  // Enrollment for students
  const handleEnroll = async (courseId) => {
    if (!user?.userId || !courseId) return;
    try {
      setEnrollingCourseId(courseId);
      setLoading(true);
      
      // Remove course from available list immediately for better UX
      setCourses(prev => prev.filter(course => course.id !== courseId));
      
      await enrollmentAPI.enroll({
        studentId: user.userId,
        courseId: courseId,
        studentName: user.username
      });
      
      showMessage('success', 'Enrolled successfully!');
      await loadEnrollments();
    } catch (error) {
      console.error('Enrollment error:', error);
      // Reload courses if enrollment failed
      await loadCourses();
      showMessage('error', 'Failed to enroll in course');
      throw error; // Re-throw to let component handle it
    } finally {
      setEnrollingCourseId(null);
      setLoading(false);
    }
  };

  // Enhanced unenroll handler that works with CourseCard
  const handleUnenroll = async (unenrollData) => {
    const { courseId, userId, enrollmentId, courseTitle } = unenrollData;
    
    try {
      console.log('🔄 Processing unenrollment:', unenrollData);
      
      // Confirm unenrollment
      const confirmUnenroll = window.confirm(
        `Are you sure you want to unenroll from "${courseTitle}"? You will lose all progress.`
      );

      if (!confirmUnenroll) {
        return;
      }

      setLoading(true);

      // Use enrollmentId if available, otherwise fallback to courseId + userId
      if (enrollmentId) {
        await enrollmentAPI.unenroll(enrollmentId);
      } else if (courseId && userId) {
        // Find the enrollment by courseId and userId
        const enrollmentToDelete = enrollments.find(e => 
          e.courseId === courseId && e.studentId === userId
        );
        if (enrollmentToDelete?.id) {
          await enrollmentAPI.unenroll(enrollmentToDelete.id);
        } else {
          throw new Error('Enrollment not found');
        }
      } else {
        throw new Error('Insufficient data to unenroll');
      }

      // Refresh data to reflect changes
      await refreshEnrollments();
      await refreshCourses();

      console.log('✅ Unenrollment processed successfully');

    } catch (error) {
      console.error('❌ Unenrollment failed:', error);
      showMessage('error', error.message || 'Failed to unenroll from course');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Rating function for CourseCard
  const handleRate = async (courseId, ratingValue) => {
    try {
      // Find the enrollment for this course
      const enrollment = enrollments.find(e => e.courseId === courseId);
      if (!enrollment?.id) {
        throw new Error('Enrollment not found for rating');
      }

      await enrollmentAPI.completeCourse(enrollment.id, {
        rating: ratingValue,
        feedback: 'Rated by student'
      });
      
      showMessage('success', '⭐ Rating submitted successfully!');
      await refreshEnrollments();
    } catch (error) {
      console.error('Rating error:', error);
      showMessage('error', 'Failed to submit rating');
      throw error;
    }
  };

  // Test function for CourseCard
  const handleStartTest = (course) => {
    console.log('Starting test for course:', course.title);
    // The actual test navigation is handled in CourseCard
    // This function can be used for any pre-test logic
  };

  // Load data based on user role
  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      try {
        if (user.role === 'STUDENT') {
          await loadCourses();
          await loadEnrollments();
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadDashboardData();
  }, [user, loadCourses, loadEnrollments]);

  return {
    // State
    user,
    courses,
    enrollments,
    loading,
    message,
    enrollingCourseId,
    
    // Functions
    showMessage,
    handleEnroll,
    handleUnenroll,
    handleRate,
    handleStartTest,
    refreshEnrollments,
    refreshCourses
  };
};