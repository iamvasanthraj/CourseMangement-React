import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
}

// Courses API calls
export const coursesAPI = {
  getAll: () => api.get('/courses'),
  create: (courseData) => api.post('/courses', courseData),
  getByInstructor: (instructorId) => api.get(`/courses/instructor/${instructorId}`),
  delete: (courseId) => api.delete(`/courses/${courseId}`),
}

// Enrollment API calls
export const enrollmentAPI = {
  enroll: (enrollmentData) => api.post('/enrollments/enroll', enrollmentData),
  getStudentEnrollments: (studentId) => api.get(`/enrollments/student/${studentId}`),
  unenroll: (enrollmentId) => api.delete(`/enrollments/${enrollmentId}`),
  markCompleted: (enrollmentId) => api.post(`/enrollments/${enrollmentId}/complete`),
}

export default api