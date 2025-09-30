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
  
  // ✅ ADD THIS: State for new course creation
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

  // ✅ ADD THIS: Course creation handler for instructors
 // In handleCreateCourse function, remove description validation:
const handleCreateCourse = async (e) => {
  e.preventDefault();
  
  if (!user?.userId) {
    showMessage('error', 'User not authenticated');
    return;
  }

  // Validate required fields (REMOVED description validation)
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

  // hooks/useDashboard.js - Add these functions to the hook

// ✅ ADD: Delete course function
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

// ✅ ADD: Update course function
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
    newCourse, // ✅ ADD THIS
    // Setters
    setNewCourse, // ✅ ADD THIS
    // Functions
    showMessage,
    handleEnroll,
    handleUnenroll,
    handleRate,
    handleStartTest,
    handleCreateCourse, 
    handleDeleteCourse, 
  handleUpdateCourse, 
    refreshEnrollments,
    refreshCourses
  };
};