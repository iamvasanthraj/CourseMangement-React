// src/services/api.js
import axios from 'axios';
import { mockTestQuestions } from '../data/mockTestQuestions';
import { getRandomQuestions } from '../utils/getRandomQuestions';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.message);

    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========================
// Auth API
// ========================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },
};

// ========================
// Courses API
// ========================
export const coursesAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (courseData) => api.post('/courses', courseData),
  update: (id, courseData) => api.put(`/courses/${id}`, courseData),
  delete: (id) => api.delete(`/courses/${id}`),
  getByInstructor: (instructorId) => api.get(`/courses/instructor/${instructorId}`),
  getByCategory: (category) => api.get(`/courses/category/${category}`),
  search: (query) => api.get(`/courses/search?query=${encodeURIComponent(query)}`),
};

// ========================
// Enrollment API
// ========================
export const enrollmentAPI = {
  enroll: (enrollmentData) => api.post('/enrollments/enroll', enrollmentData),
  getStudentEnrollments: (studentId) => api.get(`/enrollments/student/${studentId}`),
  getCourseEnrollments: (courseId) => api.get(`/enrollments/course/${courseId}`),
  markComplete: (enrollmentId) => api.put(`/enrollments/${enrollmentId}/complete`),
  unenroll: (enrollmentId) => api.delete(`/enrollments/${enrollmentId}`),
  generateCertificate: (enrollmentId) =>
    api.get(`/enrollments/${enrollmentId}/certificate`, { responseType: 'blob' }),

  // ✅ Mock test questions (returns random 10)
  getTestQuestions: (courseId) => {
    console.log('📝 Using mock test questions for course:', courseId);
    return Promise.resolve({ data: getRandomQuestions(10) });
  },

  // ✅ Enhanced test results submission with course completion
  submitTestResults: (enrollmentId, results) => {
    console.log('🎯 Submitting test results (MOCK):', { 
      enrollmentId, 
      score: results.score,
      totalQuestions: results.totalQuestions,
      passed: results.passed 
    });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse = {
          data: {
            id: Date.now(),
            enrollmentId: enrollmentId,
            score: results.score,
            totalQuestions: results.totalQuestions,
            passed: results.passed,
            submittedAt: new Date().toISOString(),
            courseCompleted: results.passed, // ✅ New field
            message: results.passed 
              ? 'Test passed! Course marked as completed! 🎓' 
              : 'Test results saved successfully!'
          }
        };
        console.log('✅ Mock test results response:', mockResponse);
        resolve(mockResponse);
      }, 1000);
    });
  }, // ✅ Added missing closing brace and comma
};

// ========================
// Rating API
// ========================
export const ratingAPI = {
  rate: (ratingData) => api.post('/ratings', ratingData),
  getCourseRatings: (courseId) => api.get(`/ratings/course/${courseId}`),
  getStudentRatings: (studentId) => api.get(`/ratings/student/${studentId}`),
  update: (id, ratingData) => api.put(`/ratings/${id}`, ratingData),
  delete: (id) => api.delete(`/ratings/${id}`),
};

// ========================
// User API
// ========================
export const userAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, userData) => api.put(`/users/${userId}`, userData),
  changePassword: (userId, passwordData) => api.put(`/users/${userId}/password`, passwordData),
};

// ========================
// Utilities
// ========================
export const apiUtils = {
  handleError: (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    throw new Error(message);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

export default api;