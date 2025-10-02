// hooks/useDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { coursesAPI, enrollmentAPI, testAPI, certificateAPI, testResultsAPI } from '../services/api'; // ✅ ADD testResultsAPI

export const useDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [certificateData, setCertificateData] = useState(null);
  
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

  // ✅ ADD: Function to mark course as completed
  const handleCompleteCourse = useCallback(async (completionData) => {
    try {
      console.log('🎯 START: handleCompleteCourse', completionData);
      
      const { enrollmentId, courseId, completionDate } = completionData;
      
      if (!enrollmentId) {
        throw new Error('Enrollment ID is required');
      }

      // Update enrollment via API to mark as completed
      const updateData = {
        completed: true,
        completionDate: completionDate || new Date().toISOString()
      };
      
      console.log('📤 API Payload for completeCourse:', updateData);
      
      const result = await enrollmentAPI.completeCourse(enrollmentId, updateData);
      console.log('✅ API Response from completeCourse:', result);
      
      // Refresh enrollments to get updated data
      await refreshEnrollments();
      
      console.log('✅ END: handleCompleteCourse - Success');
      
      return result;
      
    } catch (error) {
      console.error('❌ ERROR: handleCompleteCourse failed:', error);
      showMessage('error', 'Failed to mark course as completed: ' + error.message);
      throw error;
    }
  }, [refreshEnrollments, showMessage]);

  // ✅ UPDATED: Handle test completion with proper MySQL integration
  const handleTestCompletion = async (testResults, courseId) => {
    try {
      console.log('🎯 START: handleTestCompletion', { 
        testResults, 
        courseId,
        correctAnswers: testResults.correctAnswers,
        totalQuestions: testResults.totalQuestions,
        score: testResults.score,
        passed: testResults.passed
      });
      
      console.log('🔍 Current enrollments count:', enrollments.length);
      
      // Find the enrollment for this course
      const enrollment = enrollments.find(e => e.courseId === courseId);
      
      console.log('🔍 Enrollment found for course:', enrollment);
      
      if (enrollment?.id || enrollment?.enrollmentId) {
        const enrollmentIdToUse = enrollment.id || enrollment.enrollmentId;
        
        console.log('🔄 Processing test completion for enrollment:', enrollmentIdToUse);

        // ✅ FIRST: Save test results to MySQL (if using testResultsAPI)
        if (testResultsAPI && testResultsAPI.saveTestResult) {
          try {
            console.log('💾 Saving test results to MySQL...');
            const testResultData = {
              enrollmentId: enrollmentIdToUse,
              courseId: courseId,
              studentId: user?.userId,
              testScore: testResults.correctAnswers,
              totalQuestions: testResults.totalQuestions,
              percentage: testResults.score,
              passed: testResults.passed,
              submittedAt: new Date().toISOString()
            };
            
            const testSaveResult = await testResultsAPI.saveTestResult(testResultData);
            console.log('✅ Test results saved to MySQL:', testSaveResult);
          } catch (testError) {
            console.error('❌ Failed to save test results to MySQL:', testError);
            // Continue with enrollment update even if test save fails
          }
        }

        // ✅ SECOND: Update enrollment with test scores
        console.log('🔄 Updating enrollment with test scores...');
        const updateData = {
          testScore: testResults.correctAnswers,
          totalQuestions: testResults.totalQuestions,
          percentage: testResults.score,
          passed: testResults.passed
        };
        
        console.log('📤 API Payload for completeCourse:', updateData);
        
        const result = await enrollmentAPI.completeCourse(enrollmentIdToUse, updateData);
        console.log('✅ API Response from completeCourse:', result);
        
        // ✅ THIRD: If test passed, automatically mark course as completed
        if (testResults.passed && !enrollment.completed) {
          console.log('🏆 Test passed - marking course as completed');
          await handleCompleteCourse({
            enrollmentId: enrollmentIdToUse,
            courseId: courseId,
            completionDate: new Date().toISOString()
          });
        } else {
          // Just refresh enrollments if not completing
          await refreshEnrollments();
        }
        
        console.log('✅ END: handleTestCompletion - Success');
        
        // Show success message
        const message = testResults.passed ? 
          `🎉 Test passed! Score: ${testResults.correctAnswers}/${testResults.totalQuestions} (${testResults.score}%) - Course completed!` :
          `📝 Test completed! Score: ${testResults.correctAnswers}/${testResults.totalQuestions} (${testResults.score}%) - Try again to pass.`;
        
        showMessage('success', message);
        
        return result;
        
      } else {
        console.warn('❌ No enrollment found for course:', courseId);
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

  // ✅ ADD: View certificate for completed course
  const handleViewCertificate = useCallback((enrollmentId) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId || e.enrollmentId === enrollmentId);
    if (!enrollment) {
      showMessage('error', 'Enrollment not found');
      return null;
    }
    
    if (!enrollment.completed) {
      showMessage('error', 'Course not completed yet');
      return null;
    }
    
    if (!enrollment.passed && enrollment.testScore !== undefined) {
      showMessage('error', 'Test not passed - no certificate available');
      return null;
    }
    
    const certificate = {
      studentName: user?.username || enrollment.studentName,
      studentId: user?.userId || enrollment.studentId,
      course: {
        title: enrollment.course?.title || enrollment.courseTitle || 'Course Title',
        category: enrollment.course?.category || enrollment.courseCategory || 'General',
        instructorName: enrollment.course?.instructorName || enrollment.instructorName || 'Instructor'
      },
      completionDate: enrollment.completionDate || new Date(),
      testScore: enrollment.testScore || 0,
      totalQuestions: enrollment.totalQuestions || 0,
      percentage: enrollment.percentage || 0,
      passed: enrollment.passed || true
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
    certificateData,
    
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
    handleTestCompletion,
    handleCompleteCourse, // ✅ ADD: Export the complete course function
    handleViewCertificate,
    clearCertificateData,
    refreshEnrollments,
    refreshCourses,
    debugEnrollments // ✅ ADD: Export debug function
  };
};