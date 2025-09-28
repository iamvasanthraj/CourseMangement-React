import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
};

// Courses API
export const coursesAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (courseData) => api.post('/courses', courseData),
  update: (id, courseData) => api.put(`/courses/${id}`, courseData),
  delete: (id) => api.delete(`/courses/${id}`),
  getByInstructor: (instructorId) => api.get(`/courses/instructor/${instructorId}`),
  getByCategory: (category) => api.get(`/courses/category/${category}`),
  search: (query) => api.get(`/courses/search?query=${query}`),
};

// Enrollment API - Fixed with PUT method
export const enrollmentAPI = {
  enroll: (enrollmentData) => api.post('/enrollments/enroll', enrollmentData),
  getStudentEnrollments: (studentId) => api.get(`/enrollments/student/${studentId}`),
  getCourseEnrollments: (courseId) => api.get(`/enrollments/course/${courseId}`),
  markComplete: (enrollmentId) => api.put(`/enrollments/${enrollmentId}/complete`), // PUT method
  unenroll: (enrollmentId) => api.delete(`/enrollments/${enrollmentId}`),
  generateCertificate: (enrollmentId) => api.get(`/enrollments/${enrollmentId}/certificate`, { 
    responseType: 'blob' 
  }),
};

// Rating API
export const ratingAPI = {
  rate: (ratingData) => api.post('/ratings', ratingData),
  getCourseRatings: (courseId) => api.get(`/ratings/course/${courseId}`),
  getStudentRatings: (studentId) => api.get(`/ratings/student/${studentId}`),
  update: (id, ratingData) => api.put(`/ratings/${id}`, ratingData),
  delete: (id) => api.delete(`/ratings/${id}`),
};

export default api;