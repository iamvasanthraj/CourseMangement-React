// services/api.js

const BASE_URL = 'http://localhost:8080/api';

// Error handling class
class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

// Core API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
      } catch {
        try {
          errorMessage = await response.text();
        } catch {
          errorMessage = response.statusText;
        }
      }
      
      throw new APIError(errorMessage, response.status);
    }

    // Handle successful responses
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    if (!contentType || !contentType.includes('application/json')) {
      return { success: true, status: response.status };
    }

    if (contentLength === '0') {
      return {};
    }

    const responseText = await response.text();
    
    if (!responseText || responseText.trim() === '') {
      return {};
    }

    return JSON.parse(responseText);

  } catch (error) {
    console.error('API Call Failed:', error);
    throw error;
  }
};

// Data normalization utilities
const normalizeCourseData = (course) => {
  let averageRating = 0;
  if (course.averageRating !== undefined && course.averageRating !== null) {
    if (typeof course.averageRating === 'number') {
      averageRating = course.averageRating;
    } else if (typeof course.averageRating === 'object') {
      averageRating = course.averageRating.doubleValue ? course.averageRating.doubleValue() : 0;
    } else {
      averageRating = parseFloat(course.averageRating) || 0;
    }
  }

  const totalRatings = course.totalRatings || 0;
  const enrolledStudents = course.enrolledStudents !== undefined ? 
    course.enrolledStudents : 
    (course.enrollments ? course.enrollments.length : 0);

  let instructorName = 'Course Instructor';
  if (course.instructorName) {
    instructorName = course.instructorName;
  } else if (course.instructor) {
    if (typeof course.instructor === 'string') {
      instructorName = course.instructor;
    } else if (course.instructor.name) {
      instructorName = course.instructor.name;
    } else if (course.instructor.username) {
      instructorName = course.instructor.username;
    } else if (course.instructor.email) {
      instructorName = course.instructor.email.split('@')[0];
    }
  }

  return {
    ...course,
    averageRating,
    totalRatings,
    enrolledStudents,
    instructorName,
    duration: course.duration || '8 weeks',
    level: course.level || 'Beginner',
    batch: course.batch || 'Current Batch',
    price: course.price || 0,
    description: course.description || `Master ${course.title} through comprehensive lessons and hands-on projects.`
  };
};

const normalizeEnrollmentData = (item) => ({
  enrollmentId: item.enrollmentId || item.id,
  id: item.id || item.enrollmentId,
  studentId: item.studentId,
  studentName: item.studentName,
  courseId: item.courseId,
  courseTitle: item.courseTitle,
  courseCategory: item.courseCategory,
  enrollmentDate: item.enrollmentDate,
  completed: item.completed || false,
  completionDate: item.completionDate,
  testScore: item.testScore || 0,
  totalQuestions: item.totalQuestions || 10,
  percentage: item.percentage || 0,
  passed: item.passed || false,
  rating: item.rating,
  feedback: item.feedback,
  courseAverageRating: item.courseAverageRating || 4.5,
  courseTotalRatings: item.courseTotalRatings || Math.floor(Math.random() * 50) + 10,
  enrolledStudents: item.enrolledStudents || Math.floor(Math.random() * 100) + 20,
  instructorName: item.instructorName || 'Course Instructor',
  duration: item.duration || '8 weeks',
  level: item.level || 'Beginner',
  batch: item.batch || 'Current Batch',
  price: item.price || 0
});

// ==================== AUTHENTICATION API ====================
export const authAPI = {
  login: async (credentials) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  signup: async (userData) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    return apiCall('/auth/logout', {
      method: 'POST',
    });
  },

  refreshToken: async (refreshToken) => {
    return apiCall('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  forgotPassword: async (email) => {
    return apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token, newPassword) => {
    return apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  verifyEmail: async (token) => {
    return apiCall('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }
};

// ==================== USERS API ====================
export const usersAPI = {
  // GET operations
  getAll: async () => {
    return apiCall('/users');
  },

  getById: async (userId) => {
    return apiCall(`/users/${userId}`);
  },

  getByEmail: async (email) => {
    return apiCall(`/users/email/${email}`);
  },

  getByRole: async (role) => {
    return apiCall(`/users/role/${role}`);
  },

  getProfile: async () => {
    return apiCall('/users/profile');
  },

  // Validation operations
  checkEmail: async (email) => {
    return apiCall(`/users/check-email/${email}`);
  },

  checkUsername: async (username) => {
    return apiCall(`/users/check-username/${username}`);
  },

  // UPDATE operations
  update: async (userId, userData) => {
    return apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: userData.username,
        email: userData.email,
        avatarIndex: userData.avatar
      }),
    });
  },

  updateProfile: async (userData) => {
    return apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  updateAvatar: async (userId, avatarIndex) => {
    return apiCall(`/users/${userId}/avatar`, {
      method: 'PATCH',
      body: JSON.stringify({ avatarIndex }),
    });
  },

  changePassword: async (userId, passwordData) => {
    return apiCall(`/users/${userId}/change-password`, {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }),
    });
  },

  // DELETE operations
  delete: async (userId) => {
    return apiCall(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  deactivate: async (userId) => {
    return apiCall(`/users/${userId}/deactivate`, {
      method: 'PUT',
    });
  }
};

// ==================== COURSES API ====================
export const coursesAPI = {
  // GET operations
  getAll: async () => {
    const data = await apiCall('/courses');
    return Array.isArray(data) ? data.map(normalizeCourseData) : [];
  },

  getById: async (courseId) => {
    const course = await apiCall(`/courses/${courseId}`);
    return course ? normalizeCourseData(course) : course;
  },

  getByCategory: async (category) => {
    const data = await apiCall(`/courses/category/${category}`);
    return Array.isArray(data) ? data.map(normalizeCourseData) : [];
  },

  getByInstructor: async (instructorId) => {
    const data = await apiCall(`/courses/instructor/${instructorId}`);
    return Array.isArray(data) ? data.map(normalizeCourseData) : [];
  },

  getFeatured: async () => {
    const data = await apiCall('/courses/featured');
    return Array.isArray(data) ? data.map(normalizeCourseData) : [];
  },

  getPopular: async () => {
    const data = await apiCall('/courses/popular');
    return Array.isArray(data) ? data.map(normalizeCourseData) : [];
  },

  search: async (query) => {
    const data = await apiCall(`/courses/search?q=${encodeURIComponent(query)}`);
    return Array.isArray(data) ? data.map(normalizeCourseData) : [];
  },

  // CREATE operations
  create: async (courseData) => {
    return apiCall('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  // UPDATE operations
  update: async (courseId, courseData) => {
    return apiCall(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  },

  updateStatus: async (courseId, status) => {
    return apiCall(`/courses/${courseId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // DELETE operations
  delete: async (courseId) => {
    return apiCall(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  }
};

// ==================== ENROLLMENT API ====================
export const enrollmentAPI = {
  // GET operations
  getStudentEnrollments: async (studentId) => {
    try {
      const data = await apiCall(`/enrollments/student/${studentId}`);
      return Array.isArray(data) ? data.map(normalizeEnrollmentData) : [];
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      return [];
    }
  },

  getCourseEnrollments: async (courseId) => {
    return apiCall(`/enrollments/course/${courseId}`);
  },

  getEnrollment: async (enrollmentId) => {
    return apiCall(`/enrollments/${enrollmentId}`);
  },

  getEnrollmentByUserAndCourse: async (userId, courseId) => {
    return apiCall(`/enrollments/user/${userId}/course/${courseId}`);
  },

  // CREATE operations
  enroll: async (enrollmentData) => {
    return apiCall('/enrollments/enroll', {
      method: 'POST',
      body: JSON.stringify(enrollmentData),
    });
  },

  // UPDATE operations
  markComplete: async (enrollmentId) => {
    return apiCall(`/enrollments/${enrollmentId}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ completed: true }),
    });
  },

  completeCourse: async (enrollmentId, completionData) => {
    const updatePayload = {
      completed: completionData.completed !== undefined ? completionData.completed : true,
      ...(completionData.completionDate && { completionDate: completionData.completionDate }),
      ...(completionData.testScore !== undefined && { testScore: completionData.testScore }),
      ...(completionData.totalQuestions !== undefined && { totalQuestions: completionData.totalQuestions }),
      ...(completionData.percentage !== undefined && { percentage: completionData.percentage }),
      ...(completionData.passed !== undefined && { passed: completionData.passed }),
      ...(completionData.rating !== undefined && { rating: completionData.rating }),
      ...(completionData.feedback && { feedback: completionData.feedback })
    };

    return apiCall(`/enrollments/${enrollmentId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
    });
  },

  updateProgress: async (enrollmentId, progressData) => {
    return apiCall(`/enrollments/${enrollmentId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(progressData),
    });
  },

  // DELETE operations
  unenroll: async (enrollmentId) => {
    return apiCall(`/enrollments/${enrollmentId}`, {
      method: 'DELETE',
    });
  }
};

// ==================== RATING & REVIEWS API ====================
export const ratingAPI = {
  // CREATE operations
  rate: async (ratingData) => {
    return apiCall('/ratings', {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  },

  addReview: async (reviewData) => {
    return apiCall('/ratings/review', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  // GET operations
  getCourseRatings: async (courseId) => {
    return apiCall(`/ratings/course/${courseId}`);
  },

  getUserRating: async (userId, courseId) => {
    return apiCall(`/ratings/user/${userId}/course/${courseId}`);
  },

  getRating: async (ratingId) => {
    return apiCall(`/ratings/${ratingId}`);
  },

  // UPDATE operations
  updateRating: async (ratingId, ratingData) => {
    return apiCall(`/ratings/${ratingId}`, {
      method: 'PUT',
      body: JSON.stringify(ratingData),
    });
  },

  updateReview: async (ratingId, reviewData) => {
    return apiCall(`/ratings/${ratingId}/review`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  },

  // DELETE operations
  deleteRating: async (ratingId) => {
    return apiCall(`/ratings/${ratingId}`, {
      method: 'DELETE',
    });
  }
};

// ==================== TEST & ASSESSMENT API ====================
export const testAPI = {
  // GET operations
  getQuestions: async (courseId, count = 10) => {
    try {
      const { getRandomQuestions } = await import('../utils/questionUtils');
      return getRandomQuestions(count);
    } catch (error) {
      console.error('Error generating random questions:', error);
      // Fallback questions
      return [
        {
          id: 1,
          question: "What is the main concept of this course?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0
        },
        {
          id: 2,
          question: "Which technology is primarily used?",
          options: ["React", "Vue", "Angular", "Svelte"],
          correctAnswer: 0
        }
      ];
    }
  },

  getTestByCourse: async (courseId) => {
    return apiCall(`/tests/course/${courseId}`);
  },

  getTest: async (testId) => {
    return apiCall(`/tests/${testId}`);
  },

  // CREATE operations
  createTest: async (testData) => {
    return apiCall('/tests', {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  },

  submitTest: async (testId, answers) => {
    return apiCall(`/tests/${testId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  // Deprecated - for backward compatibility
  submitTestLegacy: async (courseId, answers) => {
    const correctAnswers = Object.values(answers).filter((answer, index) => answer === 0).length;
    const totalQuestions = Object.keys(answers).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    return {
      score,
      totalQuestions,
      passed: score >= 60,
      correctAnswers
    };
  }
};

// ==================== TEST RESULTS API ====================
export const testResultsAPI = {
  // CREATE operations
  saveTestResult: async (testData) => {
    return apiCall('/test-results/save', {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  },

  // GET operations
  getTestResultByEnrollment: async (enrollmentId) => {
    try {
      return await apiCall(`/test-results/enrollment/${enrollmentId}`);
    } catch (error) {
      console.error('Failed to fetch test result:', error);
      return { success: false, testResult: null };
    }
  },

  getTestResultsByStudent: async (studentId) => {
    return apiCall(`/test-results/student/${studentId}`);
  },

  getTestResultsByCourse: async (courseId) => {
    return apiCall(`/test-results/course/${courseId}`);
  },

  getTestResult: async (resultId) => {
    return apiCall(`/test-results/${resultId}`);
  },

  checkCoursePassed: async (courseId, studentId) => {
    return apiCall(`/test-results/check-passed/${courseId}/${studentId}`);
  },

  // UPDATE operations
  updateTestResult: async (testResultId, updateData) => {
    return apiCall(`/test-results/${testResultId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Analytics
  getTestStatistics: async (courseId) => {
    return apiCall(`/test-results/statistics/course/${courseId}`);
  }
};

// ==================== CERTIFICATE API ====================
export const certificateAPI = {
  // CREATE operations
  generate: async (certificateData) => {
    return apiCall('/certificates/generate', {
      method: 'POST',
      body: JSON.stringify(certificateData),
    });
  },

  // GET operations
  getStudentCertificates: async (studentId) => {
    return apiCall(`/certificates/student/${studentId}`);
  },

  getByEnrollment: async (enrollmentId) => {
    return apiCall(`/certificates/enrollment/${enrollmentId}`);
  },

  getById: async (certificateId) => {
    return apiCall(`/certificates/${certificateId}`);
  },

  getAll: async () => {
    return apiCall('/certificates');
  },

  // VALIDATION operations
  checkExists: async (enrollmentId) => {
    return apiCall(`/certificates/enrollment/${enrollmentId}/exists`);
  },

  validate: async (certificateId) => {
    return apiCall(`/certificates/${certificateId}/validate`);
  },

  // DOWNLOAD operations
  download: async (certificateId) => {
    return apiCall(`/certificates/${certificateId}/download`);
  },

  downloadPDF: async (certificateId) => {
    return apiCall(`/certificates/${certificateId}/download-pdf`);
  }
};

// ==================== CATEGORIES API ====================
export const categoriesAPI = {
  getAll: async () => {
    return apiCall('/categories');
  },

  getById: async (categoryId) => {
    return apiCall(`/categories/${categoryId}`);
  },

  create: async (categoryData) => {
    return apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  update: async (categoryId, categoryData) => {
    return apiCall(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  delete: async (categoryId) => {
    return apiCall(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }
};

// ==================== NOTIFICATIONS API ====================
export const notificationsAPI = {
  getUserNotifications: async (userId) => {
    return apiCall(`/notifications/user/${userId}`);
  },

  getUnreadCount: async (userId) => {
    return apiCall(`/notifications/user/${userId}/unread-count`);
  },

  markAsRead: async (notificationId) => {
    return apiCall(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async (userId) => {
    return apiCall(`/notifications/user/${userId}/mark-all-read`, {
      method: 'PUT',
    });
  },

  delete: async (notificationId) => {
    return apiCall(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },

  create: async (notificationData) => {
    return apiCall('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }
};

// ==================== FILE UPLOAD API ====================
export const uploadAPI = {
  uploadAvatar: async (userId, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return apiCall(`/upload/users/${userId}/avatar`, {
      method: 'POST',
      headers: {
        // Let browser set Content-Type for FormData
      },
      body: formData,
    });
  },

  uploadCourseImage: async (courseId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return apiCall(`/upload/courses/${courseId}/image`, {
      method: 'POST',
      body: formData,
    });
  },

  uploadResource: async (courseId, file) => {
    const formData = new FormData();
    formData.append('resource', file);
    
    return apiCall(`/upload/courses/${courseId}/resources`, {
      method: 'POST',
      body: formData,
    });
  }
};

// ==================== DASHBOARD & ANALYTICS API ====================
export const analyticsAPI = {
  getDashboardStats: async () => {
    return apiCall('/analytics/dashboard');
  },

  getInstructorStats: async (instructorId) => {
    return apiCall(`/analytics/instructor/${instructorId}`);
  },

  getStudentProgress: async (studentId) => {
    return apiCall(`/analytics/student/${studentId}/progress`);
  },

  getCourseAnalytics: async (courseId) => {
    return apiCall(`/analytics/course/${courseId}`);
  },

  getRevenueStats: async (startDate, endDate) => {
    return apiCall(`/analytics/revenue?start=${startDate}&end=${endDate}`);
  }
};

// ==================== MAIN EXPORT ====================
export default {
  auth: authAPI,
  users: usersAPI,
  courses: coursesAPI,
  enrollment: enrollmentAPI,
  test: testAPI,
  certificate: certificateAPI,
  testResults: testResultsAPI,
  rating: ratingAPI,
  categories: categoriesAPI,
  notifications: notificationsAPI,
  upload: uploadAPI,
  analytics: analyticsAPI
};