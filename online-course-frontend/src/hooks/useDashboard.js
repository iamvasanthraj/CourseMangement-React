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
  const [certificateData, setCertificateData] = useState(null); // ✅ ADD: Certificate state
  
  // State for new course creation
  const [newCourse, setNewCourse] = useState({
    title: '',
    duration: '',
    category: 'BACKEND',
    price: 0,
    level: 'BEGINNER',
    batch: 'New Batch'
  });

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  }, []);

  // Load available courses
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

  const refreshEnrollments = useCallback(async () => {
    await loadEnrollments();
  }, [loadEnrollments]);

  const refreshCourses = useCallback(async () => {
    await loadCourses();
  }, [loadCourses]);

  // ✅ ADD: Generate certificate data from test results
  const generateCertificateData = useCallback((testResults, courseData) => {
    if (!user || !testResults.passed) return null;
    
    return {
      studentName: user.username || 'Student Name',
      studentId: user.userId || 'N/A',
      course: {
        title: courseData?.title || testResults.courseTitle,
        category: courseData?.category || 'General',
        instructorName: courseData?.instructorName || 'Instructor'
      },
      completionDate: new Date(),
      testScore: testResults.correctAnswers,
      totalQuestions: testResults.totalQuestions,
      percentage: testResults.score,
      passed: testResults.passed
    };
  }, [user]);


// Add this to your useDashboard.js to debug the enrollment data
const debugEnrollments = () => {
  console.log('🔍 DEBUG - Current Enrollments Data:', enrollments);
  enrollments.forEach((enrollment, index) => {
    console.log(`🔍 Enrollment ${index + 1}:`, {
      id: enrollment.id,
      enrollmentId: enrollment.enrollmentId,
      courseTitle: enrollment.courseTitle,
      completed: enrollment.completed,
      testScore: enrollment.testScore,
      totalQuestions: enrollment.totalQuestions,
      percentage: enrollment.percentage,
      hasTestData: enrollment.testScore !== undefined
    });
  });
};

// In hooks/useDashboard.js - update handleTestCompletion
const handleTestCompletion = async (testResults, courseId) => {
  try {
    console.log('🎯 START: handleTestCompletion', { 
      testResults, 
      courseId,
      correctAnswers: testResults.correctAnswers,
      totalQuestions: testResults.totalQuestions,
      score: testResults.score
    });
    
    console.log('🔍 Current enrollments count:', enrollments.length);
    console.log('🔍 All enrollments:', enrollments.map(e => ({
      id: e.id,
      enrollmentId: e.enrollmentId,
      courseId: e.courseId,
      courseTitle: e.courseTitle,
      completed: e.completed
    })));
    
    // Find the enrollment for this course
    const enrollment = enrollments.find(e => e.courseId === courseId);
    
    console.log('🔍 Enrollment found for course:', enrollment);
    
    if (enrollment?.id || enrollment?.enrollmentId) {
      const enrollmentIdToUse = enrollment.id || enrollment.enrollmentId;
      
      console.log('🔄 Updating enrollment with API call:', {
        enrollmentId: enrollmentIdToUse,
        testScore: testResults.correctAnswers,
        totalQuestions: testResults.totalQuestions,
        percentage: testResults.score,
        passed: testResults.passed
      });

      // Update enrollment via API
      const updateData = {
        completed: true,
        testScore: testResults.correctAnswers,
        totalQuestions: testResults.totalQuestions,
        percentage: testResults.score,
        completionDate: new Date().toISOString()
      };
      
      console.log('📤 API Payload for completeCourse:', updateData);
      
      // Call the API
      console.log('📞 Calling enrollmentAPI.completeCourse...');
      const result = await enrollmentAPI.completeCourse(enrollmentIdToUse, updateData);
      console.log('✅ API Response from completeCourse:', result);
      
      // Force refresh enrollments to get updated data
      console.log('🔄 Refreshing enrollments after API call...');
      await refreshEnrollments();
      
      console.log('✅ END: handleTestCompletion - Success');
      
      // Show success message
      showMessage('success', `Test completed! Score: ${testResults.correctAnswers}/${testResults.totalQuestions} (${testResults.score}%)`);
      
      return result;
      
    } else {
      console.warn('❌ No enrollment found for course:', courseId);
      console.log('Available enrollments:', enrollments.map(e => ({
        id: e.id,
        enrollmentId: e.enrollmentId,
        courseId: e.courseId,
        courseTitle: e.courseTitle,
        completed: e.completed
      })));
      
      showMessage('error', 'Could not find enrollment to update test results');
      return null;
    }
    
  } catch (error) {
    console.error('❌ ERROR: handleTestCompletion failed:', error);
    
    // Show specific error message based on error type
    if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
      showMessage('error', 'Network error: Could not connect to server');
    } else if (error.message.includes('404')) {
      showMessage('error', 'Enrollment not found on server');
    } else if (error.message.includes('500')) {
      showMessage('error', 'Server error: Please try again later');
    } else {
      showMessage('error', 'Failed to save test results: ' + error.message);
    }
    
    throw error;
  }
};


  // ✅ ADD: View certificate for completed course
  const handleViewCertificate = useCallback((enrollmentId) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) {
      showMessage('error', 'Enrollment not found');
      return null;
    }
    
    if (!enrollment.completed) {
      showMessage('error', 'Course not completed yet');
      return null;
    }
    
    const certificate = {
      studentName: user?.username || enrollment.studentName,
      studentId: user?.userId || enrollment.studentId,
      course: {
        title: enrollment.course?.title || 'Course Title',
        category: enrollment.course?.category || 'General',
        instructorName: enrollment.course?.instructorName || 'Instructor'
      },
      completionDate: enrollment.completionDate || new Date(),
      testScore: enrollment.testScore || 0,
      totalQuestions: enrollment.totalQuestions || 0,
      percentage: enrollment.percentage || 0,
      passed: true
    };
    
    setCertificateData(certificate);
    return certificate;
  }, [enrollments, user, showMessage]);

  // ✅ ADD: Clear certificate data
  const clearCertificateData = useCallback(() => {
    setCertificateData(null);
  }, []);

  // Course creation handler for instructors
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    if (!user?.userId) {
      showMessage('error', 'User not authenticated');
      return;
    }

    // Validate required fields
    if (!newCourse.title.trim()) {
      showMessage('error', 'Course title is required');
      return;
    }

    if (!newCourse.duration.trim()) {
      showMessage('error', 'Course duration is required');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare course data with instructor information
      const courseData = {
        ...newCourse,
        instructorId: user.userId,
        instructorName: user.username,
        enrolledStudents: 0,
        rating: 0,
        totalRatings: 0,
        createdAt: new Date().toISOString()
      };

      await coursesAPI.create(courseData);
      
      // Reset form
      setNewCourse({
        title: '',
        duration: '',
        category: 'BACKEND',
        price: 0,
        level: 'BEGINNER',
        batch: 'New Batch'
      });
      
      showMessage('success', 'Course created successfully!');
      
      // Refresh courses list
      await loadCourses();
      
    } catch (error) {
      console.error('Error creating course:', error);
      showMessage('error', error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  // Enrollment handler
  const handleEnroll = async (courseId) => {
    if (!user?.userId || !courseId) return;
    try {
      setEnrollingCourseId(courseId);
      setLoading(true);
      setCourses(prev => prev.filter(course => course.id !== courseId));
      await enrollmentAPI.enroll({
        studentId: user.userId,
        courseId,
        studentName: user.username
      });
      showMessage('success', 'Enrolled successfully!');
      await loadEnrollments();
    } catch (error) {
      console.error('Enrollment error:', error);
      await loadCourses();
      showMessage('error', 'Failed to enroll in course');
      throw error;
    } finally {
      setEnrollingCourseId(null);
      setLoading(false);
    }
  };

  // Unenroll handler
  const handleUnenroll = async (unenrollData) => {
    const { courseId, userId, enrollmentId, courseTitle } = unenrollData;
    
    try {
      console.log('🔄 Processing unenrollment:', unenrollData);
      
      setLoading(true);

      if (enrollmentId) {
        await enrollmentAPI.unenroll(enrollmentId);
      } else if (courseId && userId) {
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

      await refreshEnrollments();
      await refreshCourses();

      console.log('✅ Unenrollment processed successfully');
      showMessage('success', `✅ Successfully unenrolled from "${courseTitle}"!`);

    } catch (error) {
      console.error('❌ Unenrollment failed:', error);
      showMessage('error', error.message || 'Failed to unenroll from course');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Rating handler
  const handleRate = async (courseId, ratingValue, ratingData = {}) => {
    try {
      console.log('⭐ Rating course:', { courseId, ratingValue, ratingData });

      const enrollment = enrollments.find(e => e.courseId === courseId);
      if (!enrollment?.id) {
        throw new Error('Enrollment not found for rating');
      }

      await enrollmentAPI.completeCourse(enrollment.id, {
        rating: ratingValue,
        feedback: ratingData.feedback || 'Rated by student',
        completed: true
      });

      showMessage('success', '⭐ Rating submitted successfully!');
      await refreshEnrollments();
    } catch (error) {
      console.error('Rating error:', error);
      showMessage('error', 'Failed to submit rating');
      throw error;
    }
  };

  // Delete course function
  const handleDeleteCourse = async (courseId, courseTitle) => {
    try {
      setLoading(true);
      
      await coursesAPI.delete(courseId);
      
      showMessage('success', `✅ Course "${courseTitle}" deleted successfully!`);
      
      // Refresh courses list
      await loadCourses();
      
    } catch (error) {
      console.error('Error deleting course:', error);
      showMessage('error', error.response?.data?.message || 'Failed to delete course');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update course function
  const handleUpdateCourse = async (courseId, updatedData) => {
    try {
      setLoading(true);
      
      await coursesAPI.update(courseId, updatedData);
      
      showMessage('success', '✅ Course updated successfully!');
      
      // Refresh courses list
      await loadCourses();
      
    } catch (error) {
      console.error('Error updating course:', error);
      showMessage('error', error.response?.data?.message || 'Failed to update course');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (course) => {
    console.log('Starting test for course:', course.title);
  };

  useEffect(() => {
    if (!user) return;
    const loadDashboardData = async () => {
      try {
        if (user.role === 'STUDENT') {
          await loadCourses();
          await loadEnrollments();
        }
        // For instructors, you might want to load their courses here
        if (user.role === 'INSTRUCTOR') {
          await loadCourses(); // Load courses they've created
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
    newCourse,
    certificateData, // ✅ ADD: Export certificate data
    
    // Setters
    setNewCourse,
    
    // Functions
    showMessage,
    handleEnroll,
    handleUnenroll,
    handleRate,
    handleStartTest,
    handleCreateCourse, 
    handleDeleteCourse, 
    handleUpdateCourse,
    handleTestCompletion, // ✅ ADD: Test completion handler
    handleViewCertificate, // ✅ ADD: View certificate handler
    clearCertificateData, // ✅ ADD: Clear certificate handler
    refreshEnrollments,
    refreshCourses
  };
};