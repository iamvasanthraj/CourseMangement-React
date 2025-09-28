import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import RatingModal from './RatingModal';
import Certificate from './Certificate';
import { coursesAPI, enrollmentAPI, ratingAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
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

  const categories = ['ALL', 'BACKEND', 'FRONTEND', 'CYBERSECURITY', 'DATABASE', 'MOBILE', 'DEVOPS'];
  const batches = ['New Batch', 'Ongoing', 'Completed'];

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  }, []);

  // Load enrollments for a specific course (for instructors)
  const loadCourseEnrollments = async (courseId) => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getCourseEnrollments(courseId);
      const enrollmentsData = Array.isArray(response?.data) ? response.data : [];
      
      const enrollmentsWithStudents = enrollmentsData.map((enrollment) => ({
        ...enrollment,
        studentName: `Student ${enrollment.studentId}`
      }));
      
      setSelectedCourseEnrollments(enrollmentsWithStudents);
      setShowEnrollmentsModal(true);
    } catch (error) {
      console.error('Error loading enrollments:', error);
      showMessage('error', 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  // Mark enrollment as complete
  const handleMarkComplete = async (enrollmentId) => {
    try {
      setLoading(true);
      await enrollmentAPI.markComplete(enrollmentId);
      showMessage('success', 'Course marked as completed!');
      
      if (selectedCourseEnrollments.length > 0) {
        const courseId = selectedCourseEnrollments[0].courseId;
        await loadCourseEnrollments(courseId);
      }
    } catch (error) {
      showMessage('error', 'Failed to mark as complete');
    } finally {
      setLoading(false);
    }
  };

  // Generate certificate
  const handleGenerateCertificate = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowCertificate(true);
  };

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
              enrollmentId: enrollment.enrollmentId || enrollment.id
            };
          } catch (error) {
            console.error('Error loading course details:', error);
            return {
              ...enrollment,
              course: { id: enrollment.courseId, title: 'Course not available' },
              enrollmentId: enrollment.enrollmentId || enrollment.id
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

    try {
      setLoading(true);
      await coursesAPI.delete(courseId);
      showMessage('success', 'Course deleted successfully!');
      await loadCourses();
    } catch (error) {
      showMessage('error', 'Failed to delete course');
    } finally {
      setLoading(false);
    }
  };

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

  if (!user) {
    return <div className="quantum-loading">Please log in to access the dashboard.</div>;
  }

  // EnrollmentsModal Component - MUST BE DEFINED BEFORE RETURN
  const EnrollmentsModal = ({ enrollments, loading, onMarkComplete, onGenerateCertificate, onClose }) => {
    return (
      <div className="modal-overlay">
        <div className="modal enrollments-modal">
          <div className="modal-header">
            <h3>Course Enrollments</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          
          <div className="enrollments-list">
            {enrollments.length === 0 ? (
              <p>No students have enrolled in this course yet.</p>
            ) : (
              enrollments.map((enrollment) => (
                <div key={enrollment.enrollmentId} className="enrollment-item">
                  <div className="enrollment-info">
                    <span className="student-name">{enrollment.studentName}</span>
                    <span className="enrollment-date">
                      Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                    </span>
                    <span className={`status ${enrollment.completed ? 'completed' : 'in-progress'}`}>
                      {enrollment.completed ? '✅ Completed' : '📚 In Progress'}
                    </span>
                    {enrollment.completed && (
                      <span className="completion-date">
                        Completed: {new Date(enrollment.completionDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="enrollment-actions">
                    {!enrollment.completed ? (
                      <button
                        onClick={() => onMarkComplete(enrollment.enrollmentId)}
                        disabled={loading}
                        className="complete-btn"
                      >
                        {loading ? '⏳' : '✅ Mark Complete'}
                      </button>
                    ) : (
                      <button
                        onClick={() => onGenerateCertificate(enrollment)}
                        className="certificate-btn"
                      >
                        🎓 Generate Certificate
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // EnrollmentsSection Component
  const EnrollmentsSection = React.memo(({ enrollments, loading, onUnenroll, onRate, canRateCourse, user, onGenerateCertificate }) => {
    if (!enrollments.length) {
      return (
        <div className="quantum-enrollments-section">
          <div className="section-header">
            <h2 className="quantum-text-gradient">🎓 My Enrollments (0)</h2>
          </div>
          <div className="empty-state">
            <p>You haven't enrolled in any courses yet.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="quantum-enrollments-section">
        <div className="section-header">
          <h2 className="quantum-text-gradient">🎓 My Enrollments ({enrollments.length})</h2>
        </div>
        <div className="quantum-enrollments-list">
          {enrollments.map(enrollment => {
            if (!enrollment || !enrollment.enrollmentId) return null;

            const course = enrollment.course || {};

            return (
              <div key={enrollment.enrollmentId} className="quantum-card quantum-glass">
                <div className="enrollment-info">
                  <span className="course-title quantum-glow-text">
                    {course.title || `Course ID: ${enrollment.courseId}`}
                  </span>
                  <span className="course-category quantum-badge">
                    {course.category || 'Category not available'}
                  </span>
                  <span className="enrollment-date">
                    Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </span>
                  <span className="instructor">
                    Instructor: {course.instructorName || 'Not available'}
                  </span>
                  <span className="course-price">
                    Price: ${course.price || 'N/A'}
                  </span>
                </div>
                <div className="enrollment-actions">
                  <span className={`status ${enrollment.completed ? 'completed' : 'in-progress'}`}>
                    {enrollment.completed ? '✅ Completed' : '📚 In Progress'}
                  </span>
                  <button 
                    onClick={() => onUnenroll(enrollment.enrollmentId)}
                    disabled={loading}
                    className="quantum-btn quantum-unenroll"
                  >
                    {loading ? '⏳' : '❌ Unenroll'}
                  </button>
                  
                  {/* Show Download Certificate button for completed courses */}
                  {enrollment.completed && (
                    <button 
                      onClick={() => onGenerateCertificate({
                        ...enrollment,
                        studentName: user.username,
                        studentId: user.userId
                      })}
                      className="quantum-btn quantum-certificate"
                    >
                      🎓 Download Certificate
                    </button>
                  )}
                  
                  {canRateCourse(enrollment.courseId) && (
                    <button 
                      onClick={() => onRate(course)}
                      className="quantum-btn quantum-rate"
                    >
                      ⭐ Rate Course
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  });

  // CourseCard Component
  const CourseCard = React.memo(({ course, user, isEnrolled, enrollmentId, canRate, onEnroll, onUnenroll, onRate, onDelete, onEdit, loading }) => {
    if (!course) return null;

    return (
      <div className="quantum-card quantum-hover-lift quantum-3d">
        <div className="quantum-card-header">
          <div>
            <h3 className="quantum-glow-text">{course.title}</h3>
            <span className="quantum-badge">{course.category}</span>
          </div>
          <div className="quantum-card-meta">
            <span className="quantum-tag">{course.batch}</span>
            {user?.role === 'INSTRUCTOR' && course.instructorId === user.userId && (
              <span className="quantum-badge quantum-enroll">Your Course</span>
            )}
          </div>
        </div>
        
        <p className="quantum-card-description">{course.description}</p>
        
        <div className="quantum-card-details">
          <span className="instructor">Instructor: {course.instructorName}</span>
          <span className="price">${course.price}</span>
          <div className="rating">
            ⭐ {course.rating > 0 ? course.rating.toFixed(1) : 'No ratings'} ({course.totalRatings || 0} ratings)
          </div>
        </div>

        <div className="quantum-card-actions">
          {user?.role === 'STUDENT' && (
            <>
              {!isEnrolled ? (
                <button 
                  onClick={() => onEnroll(course.id)}
                  disabled={loading}
                  className="quantum-btn quantum-action-btn quantum-enroll"
                >
                  {loading ? '⏳' : '📝 Enroll'}
                </button>
              ) : (
                <button 
                  onClick={() => onUnenroll(enrollmentId)}
                  disabled={loading}
                  className="quantum-btn quantum-action-btn quantum-unenroll"
                >
                  {loading ? '⏳' : '❌ Unenroll'}
                </button>
              )}
              {canRate && (
                <button onClick={() => onRate(course)} className="quantum-btn quantum-action-btn quantum-rate">
                  ⭐ Rate
                </button>
              )}
            </>
          )}
          {user?.role === 'INSTRUCTOR' && course.instructorId === user.userId && (
            <div className="instructor-actions">
              <button 
                onClick={() => loadCourseEnrollments(course.id)}
                className="quantum-btn quantum-action-btn"
              >
                👥 Enrollments
              </button>
              <button 
                onClick={() => onEdit(course)}
                className="quantum-btn quantum-action-btn"
              >
                ✏️ Edit
              </button>
              <button 
                onClick={() => onDelete(course.id)}
                className="quantum-btn quantum-action-btn quantum-unenroll"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  });

  // RETURN STATEMENT - MUST COME AFTER ALL COMPONENT DEFINITIONS
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
        <div className="quantum-glass quantum-card quantum-bounce">
          <h2 className="quantum-text-gradient">🎯 {editingCourse ? 'Edit Course' : 'Create New Course'}</h2>
          <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}>
            <div className="form-row">
              <div className="quantum-form-group">
                <label htmlFor="course-title">Course Title</label>
                <input
                  id="course-title"
                  type="text"
                  className="quantum-input"
                  placeholder="Course Title"
                  value={editingCourse ? editingCourse.title : newCourse.title}
                  onChange={(e) => editingCourse 
                    ? setEditingCourse({...editingCourse, title: e.target.value})
                    : setNewCourse({...newCourse, title: e.target.value})
                  }
                  required
                />
              </div>
              <div className="quantum-form-group">
                <label htmlFor="course-category">Category</label>
                <select
                  id="course-category"
                  className="quantum-input"
                  value={editingCourse ? editingCourse.category : newCourse.category}
                  onChange={(e) => editingCourse
                    ? setEditingCourse({...editingCourse, category: e.target.value})
                    : setNewCourse({...newCourse, category: e.target.value})
                  }
                  required
                >
                  {categories.filter(cat => cat !== 'ALL').map(category => (
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
                  value={editingCourse ? editingCourse.price : newCourse.price}
                  onChange={(e) => editingCourse
                    ? setEditingCourse({...editingCourse, price: parseFloat(e.target.value) || 0})
                    : setNewCourse({...newCourse, price: parseFloat(e.target.value) || 0})
                  }
                  required
                />
              </div>
              <div className="quantum-form-group">
                <label htmlFor="course-batch">Batch</label>
                <select
                  id="course-batch"
                  className="quantum-input"
                  value={editingCourse ? editingCourse.batch : newCourse.batch}
                  onChange={(e) => editingCourse
                    ? setEditingCourse({...editingCourse, batch: e.target.value})
                    : setNewCourse({...newCourse, batch: e.target.value})
                  }
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
                value={editingCourse ? editingCourse.description : newCourse.description}
                onChange={(e) => editingCourse
                  ? setEditingCourse({...editingCourse, description: e.target.value})
                  : setNewCourse({...newCourse, description: e.target.value})
                }
                rows="4"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="quantum-btn" disabled={loading}>
                {loading ? '⏳' : editingCourse ? '💾 Update Course' : '🚀 Create Course'}
              </button>
              {editingCourse && (
                <button 
                  type="button" 
                  className="quantum-btn quantum-btn-secondary"
                  onClick={() => setEditingCourse(null)}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
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
        />
      )}

      {/* Modals */}
      {showEnrollmentsModal && (
        <EnrollmentsModal
          enrollments={selectedCourseEnrollments}
          loading={loading}
          onMarkComplete={handleMarkComplete}
          onGenerateCertificate={handleGenerateCertificate}
          onClose={() => setShowEnrollmentsModal(false)}
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