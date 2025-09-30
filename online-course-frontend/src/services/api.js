// services/api.js

const BASE_URL = 'http://localhost:8080/api';

// Fixed API call function with better error handling
const apiCall = async (endpoint, options = {}) => {
  try {
    console.log(`🔍 API Call: ${endpoint}`, options);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log(`🔍 API Response Status: ${response.status} for ${endpoint}`);

    if (!response.ok) {
      // Get error message from response body
      const errorText = await response.text();
      console.error(`❌ API Error ${response.status}:`, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText || response.statusText}`);
    }

    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    console.log(`🔍 Response Headers - Content-Type: ${contentType}, Content-Length: ${contentLength}`);

    // If no content or not JSON, return empty object or appropriate value
    if (!contentType || !contentType.includes('application/json')) {
      console.log('🔍 Response is not JSON, returning success status');
      return { success: true, status: response.status };
    }

    if (contentLength === '0') {
      console.log('🔍 Response is empty, returning empty object');
      return {};
    }

    // Try to parse JSON safely
    const responseText = await response.text();
    console.log(`🔍 Raw response length: ${responseText.length} characters`);
    
    // Log first 500 chars for debugging
    if (responseText.length > 0) {
      console.log(`🔍 Response preview: ${responseText.substring(0, 500)}...`);
    }

    if (!responseText || responseText.trim() === '') {
      console.log('🔍 Empty response text, returning empty object');
      return {};
    }

    try {
      const data = JSON.parse(responseText);
      console.log(`🔍 Parsed JSON data:`, data);
      return data;
    } catch (parseError) {
      console.error(`❌ JSON Parse Error for ${endpoint}:`, parseError);
      console.error(`❌ Problematic response: ${responseText.substring(0, 1000)}`);
      throw new Error(`Invalid JSON response from server: ${parseError.message}`);
    }

  } catch (error) {
    console.error('❌ API Call Failed:', error);
    throw error;
  }
};

// Authentication API
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
};

// Users API
export const usersAPI = {
  getAll: async () => {
    return apiCall('/users');
  },

  getById: async (userId) => {
    return apiCall(`/users/${userId}`);
  },

  getByEmail: async (email) => {
    return apiCall(`/users/email/${email}`);
  },

  update: async (userId, userData) => {
    return apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (userId) => {
    return apiCall(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  getByRole: async (role) => {
    return apiCall(`/users/role/${role}`);
  },

  checkEmail: async (email) => {
    return apiCall(`/users/check-email/${email}`);
  },
};

// Courses API
// In your coursesAPI object, add this method:
export const coursesAPI = {
  getAll: async () => {
    return apiCall('/courses');
  },

  // ADD THIS METHOD:
  getById: async (courseId) => {
    return apiCall(`/courses/${courseId}`);
  },

  getByCategory: async (category) => {
    return apiCall(`/courses/category/${category}`);
  },

  getInstructorCourses: async (instructorId) => {
    return apiCall(`/courses/instructor/${instructorId}`);
  },

  create: async (courseData) => {
    return apiCall('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

   update: async (courseId, courseData) => {
    return apiCall(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  },

  delete: async (courseId) => {
    return apiCall(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  },
};

// services/api.js - update getStudentEnrollments to handle nested data
// services/api.js - Complete enrollmentAPI with all methods
export const enrollmentAPI = {
  getStudentEnrollments: async (studentId) => {
    console.log(`🎓 Fetching enrollments for student: ${studentId}`);
    try {
      const data = await apiCall(`/enrollments/student/${studentId}`);
      
      // Handle field name mapping with fallbacks for missing test score fields
      const normalizedData = Array.isArray(data) ? data.map(item => {
        return {
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
          // ✅ CRITICAL: Add fallbacks for missing test score fields
          testScore: item.testScore || 0,
          totalQuestions: item.totalQuestions || 10,
          percentage: item.percentage || 0,
          rating: item.rating,
          feedback: item.feedback
        };
      }) : [];
      
      console.log(`🎓 Normalized ${normalizedData.length} enrollments`);
      return normalizedData;
    } catch (error) {
      console.error('🎓 Error fetching enrollments:', error);
      return [];
    }
  },

  getCourseEnrollments: async (courseId) => {
    return apiCall(`/enrollments/course/${courseId}`);
  },

  enroll: async (enrollmentData) => {
    return apiCall('/enrollments/enroll', {
      method: 'POST',
      body: JSON.stringify(enrollmentData),
    });
  },

  unenroll: async (enrollmentId) => {
    return apiCall(`/enrollments/${enrollmentId}`, {
      method: 'DELETE',
    });
  },

  markComplete: async (enrollmentId) => {
    return apiCall(`/enrollments/${enrollmentId}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ completed: true }),
    });
  },

  // ✅ ADD THIS MISSING METHOD:
  completeCourse: async (enrollmentId, ratingData) => {
    console.log('🎓 Completing course with test scores:', { 
      enrollmentId, 
      ratingData
    });
    
    try {
      const result = await apiCall(`/enrollments/${enrollmentId}/complete`, {
        method: 'PUT',
        body: JSON.stringify(ratingData),
      });
      
      console.log('✅ completeCourse API Success - Response:', result);
      return result;
    } catch (error) {
      console.error('❌ completeCourse API Error:', error);
      throw error;
    }
  },
};

// Add this to your services/api.js
export const ratingAPI = {
  rate: async (ratingData) => {
    return apiCall('/ratings', {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  },

  getCourseRatings: async (courseId) => {
    return apiCall(`/ratings/course/${courseId}`);
  },

  getUserRating: async (userId, courseId) => {
    return apiCall(`/ratings/user/${userId}/course/${courseId}`);
  },
};

// Test API (Mock for now)
export const testAPI = {
  getQuestions: async (courseId) => {
    // Mock questions - replace with actual API when available
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
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
        ]);
      }, 500);
    });
  },

  submitTest: async (courseId, answers) => {
    // Mock submission - replace with actual API when available
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          score: 85,
          totalQuestions: 2,
          passed: true,
          correctAnswers: 2
        });
      }, 1000);
    });
  },
};

// Certificate API
export const certificateAPI = {
  generate: async (certificateData) => {
    return apiCall('/certificates/generate', {
      method: 'POST',
      body: JSON.stringify(certificateData),
    });
  },

  getStudentCertificates: async (studentId) => {
    return apiCall(`/certificates/student/${studentId}`);
  },

  getByEnrollment: async (enrollmentId) => {
    return apiCall(`/certificates/enrollment/${enrollmentId}`);
  },

  checkExists: async (enrollmentId) => {
    return apiCall(`/certificates/enrollment/${enrollmentId}/exists`);
  },

  download: async (certificateId) => {
    return apiCall(`/certificates/${certificateId}/download`);
  },

  getById: async (certificateId) => {
    return apiCall(`/certificates/${certificateId}`);
  },
};

// Export all APIs
export default {
  auth: authAPI,
  users: usersAPI,
  courses: coursesAPI,
  enrollment: enrollmentAPI,
  test: testAPI,
  certificate: certificateAPI,
};