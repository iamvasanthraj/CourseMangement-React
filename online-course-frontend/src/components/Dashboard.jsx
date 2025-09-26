import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { coursesAPI, enrollmentAPI } from '../services/api'

const Dashboard = () => {
  const { user } = useAuth() // Remove logout from here
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [newCourse, setNewCourse] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    loadCourses()
    if (user?.role === 'STUDENT') {
      loadEnrollments()
    }
  }, [user])

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const loadCourses = async () => {
    try {
      setLoading(true)
      const response = await coursesAPI.getAll()
      setCourses(response.data)
    } catch (error) {
      console.error('Error loading courses:', error)
      showMessage('error', 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const loadEnrollments = async () => {
    try {
      const response = await enrollmentAPI.getStudentEnrollments(user.userId)
      setEnrollments(response.data)
    } catch (error) {
      console.error('Error loading enrollments:', error)
      showMessage('error', 'Failed to load enrollments')
    }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await coursesAPI.create({
        ...newCourse,
        instructorId: user.userId
      })
      setNewCourse({ title: '', description: '' })
      showMessage('success', 'Course created successfully!')
      loadCourses()
    } catch (error) {
      console.error('Error creating course:', error)
      showMessage('error', error.response?.data || 'Failed to create course')
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId) => {
    try {
      setLoading(true)
      await enrollmentAPI.enroll({
        studentId: user.userId,
        courseId: courseId
      })
      showMessage('success', 'Enrolled successfully!')
      loadEnrollments()
    } catch (error) {
      console.error('Error enrolling:', error)
      showMessage('error', error.response?.data || 'Failed to enroll in course')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkCompleted = async (enrollmentId) => {
    try {
      await enrollmentAPI.markCompleted(enrollmentId)
      showMessage('success', 'Course marked as completed!')
      loadEnrollments()
    } catch (error) {
      console.error('Error marking as completed:', error)
      showMessage('error', 'Failed to update course status')
    }
  }

  const handleUnenroll = async (enrollmentId) => {
    try {
      await enrollmentAPI.unenroll(enrollmentId)
      showMessage('success', 'Unenrolled from course')
      loadEnrollments()
    } catch (error) {
      console.error('Error unenrolling:', error)
      showMessage('error', 'Failed to unenroll')
    }
  }

  return (
    <div className="dashboard">
     <header>
        <div className="user-info">
          <h1>Welcome back, {user?.username}! 👋</h1>
          <p className="user-role">Role: {user?.role}</p>
        </div>
        {/* REMOVE THIS LOGOUT BUTTON - it's already in Navigation */}
      </header>

      {/* Message Display */}
      {message.text && (
        <div className={`message ${message.type}-message`}>
          {message.text}
        </div>
      )}

      {user?.role === 'INSTRUCTOR' && (
        <div className="instructor-section">
          <h2>🎯 Create New Course</h2>
          <form onSubmit={handleCreateCourse}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Course Title"
                value={newCourse.title}
                onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Course Description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                rows="4"
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? '⏳ Creating...' : '🚀 Create Course'}
            </button>
          </form>
        </div>
      )}

      <div className="courses-section">
        <div className="section-header">
          <h2>📚 Available Courses</h2>
          <span className="course-count">{courses.length} courses available</span>
        </div>
        
        {loading ? (
          <div className="loading">Loading courses...</div>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <h3>{course.title}</h3>
                  {user?.role === 'INSTRUCTOR' && course.instructorId === user.userId && (
                    <span className="badge">Your Course</span>
                  )}
                </div>
                <p>{course.description || 'No description provided.'}</p>
                <div className="course-actions">
                  {user?.role === 'STUDENT' && (
                    <button 
                      onClick={() => handleEnroll(course.id)}
                      disabled={loading}
                      className="enroll-btn"
                    >
                      {loading ? '⏳' : '📝 Enroll'}
                    </button>
                  )}
                  {user?.role === 'INSTRUCTOR' && course.instructorId === user.userId && (
                    <button className="secondary-btn">
                      ✏️ Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {courses.length === 0 && !loading && (
          <div className="empty-state">
            <p>No courses available yet.</p>
            {user?.role === 'INSTRUCTOR' && (
              <p>Create the first course to get started!</p>
            )}
          </div>
        )}
      </div>

      {user?.role === 'STUDENT' && (
        <div className="enrollments-section">
          <div className="section-header">
            <h2>🎓 My Enrollments</h2>
            <span className="enrollment-count">{enrollments.length} enrolled</span>
          </div>
          
          {enrollments.length === 0 ? (
            <div className="empty-state">
              <p>You haven't enrolled in any courses yet.</p>
              <p>Browse the available courses above and start learning!</p>
            </div>
          ) : (
            <div className="enrollments-list">
              {enrollments.map(enrollment => (
                <div key={enrollment.id} className="enrollment-card">
                  <div className="enrollment-info">
                    <span className="course-title">{enrollment.course?.title}</span>
                    <span className="enrollment-date">
                      Enrolled on: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="enrollment-actions">
                    <span className={`status ${enrollment.completed ? 'completed' : 'in-progress'}`}>
                      {enrollment.completed ? '✅ Completed' : '📚 In Progress'}
                    </span>
                    {!enrollment.completed && (
                      <button 
                        onClick={() => handleMarkCompleted(enrollment.id)}
                        className="complete-btn"
                      >
                        Mark Complete
                      </button>
                    )}
                    <button 
                      onClick={() => handleUnenroll(enrollment.id)}
                      className="danger-btn"
                    >
                      Unenroll
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard