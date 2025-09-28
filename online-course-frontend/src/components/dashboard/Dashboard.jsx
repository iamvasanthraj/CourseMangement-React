import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import RatingModal from './RatingModal';
import Certificate from '../shared/Certificate';
import { getRandomQuestions } from '../../utils/getRandomQuestions';

import { coursesAPI, enrollmentAPI, ratingAPI } from '../../services/api';
import "../../styles/dashboard.css";
import CourseEnrollments from './CourseEnrollments';
import EnrollmentsModal from './EnrollmentsModal';
import TestModal from '../test/TestModal';
import EnrollmentsSection from './EnrollmentsSection';
import CourseCard from './CourseCard';
import CourseForm from './CourseForm';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

 const [newCourse, setNewCourse] = useState({ 
  title: '', 
  description: '', 
  category: 'BACKEND', 
  price: 0,
  batch: 'New Batch'
});

  const [editingCourse, setEditingCourse] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [rating, setRating] = useState({ stars: 5, comment: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('ALL');
  const [selectedCourseEnrollments, setSelectedCourseEnrollments] = useState([]);
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [selectedEnrollmentForTest, setSelectedEnrollmentForTest] = useState(null);

  const categories = ['ALL', 'BACKEND', 'FRONTEND', 'CYBERSECURITY', 'DATABASE', 'MOBILE', 'DEVOPS'];
  const batches = ['New Batch', 'Ongoing', 'Completed'];

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  }, []);

  // Data loading functions
  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getAll();
      const coursesData = Array.isArray(response?.data) ? response.data : 
                         Array.isArray(response) ? response : [];
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
      showMessage('error', 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  const loadEnrollments = useCallback(async () => {
    if (!user?.userId) return;

    try {
      const response = await enrollmentAPI.getStudentEnrollments(user.userId);
      console.log('Student enrollments response:', response);
      
      const enrollmentsData = Array.isArray(response?.data) ? response.data : 
                             Array.isArray(response) ? response : [];
      
      const enrollmentsWithCourses = await Promise.all(
        enrollmentsData.map(async (enrollment) => {
          if (!enrollment?.courseId) return null;

          try {
            const courseResponse = await coursesAPI.getById(enrollment.courseId);
            const courseData = courseResponse?.data || courseResponse;
            
            return {
              ...enrollment,
              course: courseData,
              enrollmentId: enrollment.enrollmentId || enrollment.id,
              completed: enrollment.completed || false,
              completionDate: enrollment.completionDate || null,
              studentName: user.username,
              studentId: user.userId
            };
          } catch (error) {
            console.error('Error loading course details:', error);
            return {
              ...enrollment,
              course: { 
                id: enrollment.courseId, 
                title: 'Course not available',
                category: 'Unknown',
                instructorName: 'Instructor not available'
              },
              enrollmentId: enrollment.enrollmentId || enrollment.id,
              completed: enrollment.completed || false,
              completionDate: enrollment.completionDate || null,
              studentName: user.username,
              studentId: user.userId
            };
          }
        })
      );
      
      setEnrollments(enrollmentsWithCourses.filter(Boolean));
    } catch (error) {
      console.error('Error loading enrollments:', error);
      showMessage('error', 'Failed to load enrollments');
    }
  }, [user?.userId, showMessage]);

  // ✅ MOVE useEffect HERE - AFTER loadEnrollments is defined
  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      if (isMounted) {
        await loadCourses();
        if (user?.role === 'STUDENT') {
          await loadEnrollments();
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [user, loadCourses, loadEnrollments]);

  // ✅ MOVE test completion handler HERE - AFTER loadEnrollments is defined
  useEffect(() => {
    if (location.state?.testCompleted) {
      const { score, totalQuestions, passed, storedLocally, correctAnswers, courseMarkedComplete } = location.state;
      
      const correctCount = correctAnswers || Math.round((score / 100) * totalQuestions);
      
      let message = '';
      
      if (storedLocally) {
        message = `Test completed! ${correctCount}/${totalQuestions} correct (${score}%) - Stored locally`;
      } else {
        message = `Test completed! ${correctCount}/${totalQuestions} correct (${score}%) - ${passed ? 'PASSED ✅' : 'FAILED ❌'}`;
        
        // ✅ Add course completion message if test was passed
        if (passed && courseMarkedComplete) {
          message += ' - Course marked as completed! 🎓';
        }
      }
      
      showMessage('success', message);
      
      // ✅ Reload enrollments to reflect the updated completion status
      if (passed && courseMarkedComplete) {
        loadEnrollments();
      }
      
      // Clear the location state to prevent showing the message again
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showMessage, loadEnrollments]);

  // Rest of your functions (handleCreateCourse, handleUpdateCourse, etc.)...
  // Course management functions
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!user?.userId) {
      showMessage('error', 'User not authenticated');
      return;
    }

    try {
      setLoading(true);
      await coursesAPI.create({
        ...newCourse,
        instructorName: user.username,
        instructorId: user.userId
      });
      setNewCourse({ title: '', description: '', category: 'BACKEND', price: 0, batch: 'New Batch' });
      showMessage('success', 'Course created successfully!');
      await loadCourses();
    } catch (error) {
      showMessage('error', error.response?.data?.message || error.response?.data || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse?.id) return;

    try {
      setLoading(true);
      await coursesAPI.update(editingCourse.id, {
        title: editingCourse.title,
        description: editingCourse.description,
        category: editingCourse.category,
        price: editingCourse.price,
        batch: editingCourse.batch
      });
      setEditingCourse(null);
      showMessage('success', 'Course updated successfully!');
      await loadCourses();
    } catch (error) {
      showMessage('error', error.response?.data?.message || error.response?.data || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!courseId) return;

    const course = courses.find(c => c.id === courseId);
    
    // Check ownership
    if (course && course.instructorId !== user.userId) {
      showMessage('error', 'You can only delete your own courses');
      return;
    }

    try {
      setLoading(true);
      await coursesAPI.delete(courseId);
      showMessage('success', 'Course deleted successfully!');
      await loadCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      showMessage('error', error.response?.data?.message || 'Failed to delete course');
    } finally {
      setLoading(false);
    }
  };

  // Enrollment functions
  const handleEnroll = async (courseId) => {
    if (!user?.userId || !courseId) return;

    try {
      setLoading(true);
      await enrollmentAPI.enroll({
        studentId: user.userId,
        courseId: courseId
      });
      showMessage('success', 'Enrolled successfully!');
      await loadEnrollments();
      await loadCourses();
    } catch (error) {
      showMessage('error', error.response?.data?.message || error.response?.data || 'Failed to enroll in course');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (enrollmentId) => {
    if (!enrollmentId) {
      showMessage('error', 'Invalid enrollment ID');
      return;
    }

    try {
      setLoading(true);
      await enrollmentAPI.unenroll(enrollmentId);
      showMessage('success', 'Unenrolled successfully!');
      await loadEnrollments();
      await loadCourses();
    } catch (error) {
      console.error('Unenroll error:', error);
      if (error.response?.status === 404) {
        showMessage('error', 'Enrollment not found. Refreshing list...');
        await loadEnrollments();
      } else {
        showMessage('error', error.response?.data?.message || error.response?.data || 'Failed to unenroll');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCourseEnrollments = async (courseId) => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getCourseEnrollments(courseId);
      console.log('=== BACKEND RESPONSE ===');
      console.log('Full response:', response);
      console.log('Response data:', response?.data);
      
      const enrollmentsData = Array.isArray(response?.data) ? response.data : [];
      console.log('Enrollments array:', enrollmentsData);
      
      const enrollmentsWithStudents = enrollmentsData.map((enrollment) => {
        return {
          enrollmentId: enrollment.enrollmentId || enrollment.id,
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
          studentName: `Student #${enrollment.studentId}`,
          enrollmentDate: enrollment.enrollmentDate,
          completed: enrollment.completed || false,
          completionDate: enrollment.completionDate,
          course: {
            title: enrollment.courseTitle || 'Course',
            category: enrollment.courseCategory || 'Category',
            instructorName: enrollment.instructorName || 'Instructor'
          }
        };
      });
      
      console.log('Processed enrollments:', enrollmentsWithStudents);
      setSelectedCourseEnrollments(enrollmentsWithStudents);
      setShowEnrollmentsModal(true);
    } catch (error) {
      console.error('Error loading enrollments:', error);
      showMessage('error', 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (enrollmentId) => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.markComplete(enrollmentId);
      console.log('Mark complete response:', response);
      
      showMessage('success', 'Course marked as completed!');
      
      if (selectedCourseEnrollments.length > 0) {
        const courseId = selectedCourseEnrollments[0].courseId;
        await loadCourseEnrollments(courseId);
      }
    } catch (error) {
      console.error('Mark complete error:', error);
      showMessage('error', 'Failed to mark as complete');
    } finally {
      setLoading(false);
    }
  };

  // Rating functions
  const handleRateCourse = (course) => {
    if (!course?.id) return;
    setSelectedCourse(course);
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!selectedCourse?.id || !user?.userId) return;

    try {
      await ratingAPI.rate({
        stars: rating.stars,
        comment: rating.comment,
        studentId: user.userId,
        courseId: selectedCourse.id
      });
      setShowRatingModal(false);
      setRating({ stars: 5, comment: '' });
      setSelectedCourse(null);
      showMessage('success', 'Rating submitted successfully!');
      await loadCourses();
    } catch (error) {
      showMessage('error', error.response?.data?.message || error.response?.data || 'Failed to submit rating');
    }
  };

  // Certificate functions
  const handleGenerateCertificate = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowCertificate(true);
  };

  const handleStartTest = async (enrollment) => {
    try {
      setLoading(true);
      console.log('🔄 Starting test for enrollment:', enrollment);
      
      // Get test questions from the API
      const response = await enrollmentAPI.getTestQuestions(enrollment.courseId);
      console.log('📝 Test questions response:', response);
      
      if (response.data && response.data.length > 0) {
        const questions = response.data;
        console.log(`✅ Loaded ${questions.length} questions`);
        
        // Store questions and enrollment info for the test
        setTestQuestions(questions);
        setSelectedEnrollmentForTest(enrollment);
        setShowTestModal(true);
      } else {
        console.error('❌ No questions received');
        showMessage('error', 'No test questions available for this course');
      }
    } catch (error) {
      console.error('❌ Error loading test questions:', error);
      showMessage('error', 'Failed to load test questions');
    } finally {
      setLoading(false);
    }
  };

  // Handle when user confirms starting the test
  const handleConfirmStartTest = () => {
    if (!selectedEnrollmentForTest || testQuestions.length === 0) {
      console.error('❌ Missing test data:', {
        enrollment: selectedEnrollmentForTest,
        questions: testQuestions.length
      });
      showMessage('error', 'Test data not loaded properly');
      return;
    }

    console.log('🚀 Navigating to test page with:', {
      enrollmentId: selectedEnrollmentForTest.enrollmentId,
      courseId: selectedEnrollmentForTest.courseId,
      questionsCount: testQuestions.length
    });

    // Navigate to test page with all necessary data
    navigate('/test', {
      state: {
        enrollmentId: selectedEnrollmentForTest.enrollmentId,
        courseId: selectedEnrollmentForTest.courseId,
        courseTitle: selectedEnrollmentForTest.course?.title,
        questions: testQuestions,
        studentId: user.userId,
        studentName: user.username
      }
    });
    
    // Close modal and reset state
    setShowTestModal(false);
    setSelectedEnrollmentForTest(null);
    setTestQuestions([]);
  };

  // Handle when user cancels starting the test
  const handleCancelStartTest = () => {
    setShowTestModal(false);
    setSelectedEnrollmentForTest(null);
    setTestQuestions([]);
  };

  // Helper functions
  const isEnrolled = useCallback((courseId) => {
    return enrollments.some(e => e.courseId === courseId);
  }, [enrollments]);

  const getEnrollmentId = useCallback((courseId) => {
    const enrollment = enrollments.find(e => e.courseId === courseId);
    return enrollment?.enrollmentId || enrollment?.id;
  }, [enrollments]);

  const canRateCourse = useCallback((courseId) => {
    const enrollment = enrollments.find(e => e.courseId === courseId);
    return !!enrollment;
  }, [enrollments]);

  const filteredCourses = filter === 'ALL' 
    ? courses 
    : courses.filter(course => course.category === filter);

  const availableCourses = user?.role === 'STUDENT' 
    ? filteredCourses.filter(course => !isEnrolled(course.id))
    : filteredCourses;

  if (!user) {
    return <div className="quantum-loading">Please log in to access the dashboard.</div>;
  }

  return (
    <div className="quantum-dashboard">
      <header className="quantum-user-info">
        <h1 className="quantum-glow-text">Welcome back, {user?.username}! 👋</h1>
        <p className="quantum-user-role">Role: {user?.role}</p>
      </header>

      {message.text && (
        <div className={`quantum-message quantum-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      {user?.role === 'INSTRUCTOR' && (
        <CourseForm
          editingCourse={editingCourse}
          newCourse={newCourse}
          loading={loading}
          onUpdateCourse={handleUpdateCourse}
          onCreateCourse={handleCreateCourse}
          onCancelEdit={() => setEditingCourse(null)}
          onNewCourseChange={setNewCourse}
          onEditingCourseChange={setEditingCourse}
        />
      )}

      <div className="quantum-courses-section">
        <div className="section-header">
          <h2 className="quantum-text-gradient">📚 {user?.role === 'STUDENT' ? 'Available Courses' : 'All Courses'}</h2>
          <div className="quantum-filters">
            <label htmlFor="category-filter">Filter by category:</label>
            <select 
              id="category-filter" 
              className="quantum-filter-select"
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <span className="quantum-counter">{availableCourses.length} courses</span>
          </div>
        </div>
        
        {loading ? (
          <div className="quantum-loading" aria-live="polite">Loading courses...</div>
        ) : (
          <div className="quantum-grid">
            {availableCourses.map(course => (
              <CourseCard 
                key={course.id}
                course={course}
                user={user}
                isEnrolled={isEnrolled(course.id)}
                enrollmentId={getEnrollmentId(course.id)}
                canRate={canRateCourse(course.id)}
                onEnroll={handleEnroll}
                onUnenroll={handleUnenroll}
                onRate={handleRateCourse}
                onDelete={handleDeleteCourse}
                onEdit={setEditingCourse}
                onViewEnrollments={loadCourseEnrollments}
                loading={loading}
              />
            ))}
          </div>
        )}
        
        {availableCourses.length === 0 && !loading && (
          <div className="empty-state">
            <p>No courses found in {filter} category.</p>
          </div>
        )}
      </div>

      {user?.role === 'STUDENT' && (
        <EnrollmentsSection 
          enrollments={enrollments}
          loading={loading}
          onUnenroll={handleUnenroll}
          onRate={handleRateCourse}
          canRateCourse={canRateCourse}
          user={user}
          onGenerateCertificate={handleGenerateCertificate}
          onStartTest={handleStartTest}
        />
      )}

      {/* Modals */}
     {showEnrollmentsModal && (
  <CourseEnrollments
    enrollments={selectedCourseEnrollments}
    loading={loading}
    onMarkComplete={handleMarkComplete}
    onGenerateCertificate={handleGenerateCertificate}
    onClose={() => setShowEnrollmentsModal(false)}
  />
)}

   {showTestModal && (
  <TestModal
    questions={testQuestions}
    onConfirm={handleConfirmStartTest}
    onClose={handleCancelStartTest}
  />
)}

      {showCertificate && selectedEnrollment && (
  <Certificate
    enrollment={selectedEnrollment}
    onClose={() => setShowCertificate(false)}
  />
)}

      {showRatingModal && (
        <RatingModal 
          course={selectedCourse}
          rating={rating}
          onRatingChange={setRating}
          onSubmit={submitRating}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;