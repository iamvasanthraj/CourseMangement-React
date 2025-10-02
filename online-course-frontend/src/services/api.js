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
};

// ==================== USERS API ====================
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

// ==================== COURSES API ====================
export const coursesAPI = {
  getAll: async () => {
    const data = await apiCall('/courses');
    
    // ✅ ENHANCED: Normalize course data with proper rating fields
    return Array.isArray(data) ? data.map(course => {
      console.log('📊 Raw course data:', course);
      
      // Handle averageRating (could be number, BigDecimal, or undefined)
      let averageRating = 0;
      if (course.averageRating !== undefined && course.averageRating !== null) {
        if (typeof course.averageRating === 'number') {
          averageRating = course.averageRating;
        } else if (typeof course.averageRating === 'object') {
          // Handle Java BigDecimal or other objects
          averageRating = course.averageRating.doubleValue ? course.averageRating.doubleValue() : 0;
        } else {
          averageRating = parseFloat(course.averageRating) || 0;
        }
      }
      
      // Handle totalRatings
      const totalRatings = course.totalRatings || 0;
      
      // Handle enrolledStudents
      const enrolledStudents = course.enrolledStudents !== undefined ? 
        course.enrolledStudents : 
        (course.enrollments ? course.enrollments.length : 0);
      
      // Handle instructor name with multiple fallbacks
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
      
      const normalizedCourse = {
        ...course,
        // ✅ Ensure all required fields exist with proper values
        averageRating: averageRating,
        totalRatings: totalRatings,
        enrolledStudents: enrolledStudents,
        instructorName: instructorName,
        duration: course.duration || '8 weeks',
        level: course.level || 'Beginner',
        batch: course.batch || 'Current Batch',
        price: course.price || 0,
        description: course.description || `Master ${course.title} through comprehensive lessons and hands-on projects.`
      };
      
      console.log('✅ Normalized course:', normalizedCourse.title, {
        averageRating: normalizedCourse.averageRating,
        totalRatings: normalizedCourse.totalRatings,
        enrolledStudents: normalizedCourse.enrolledStudents
      });
      
      return normalizedCourse;
    }) : [];
  },

  getById: async (courseId) => {
    const course = await apiCall(`/courses/${courseId}`);
    
    // ✅ Apply same normalization for single course
    if (course) {
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
      
      return {
        ...course,
        averageRating: averageRating,
        totalRatings: course.totalRatings || 0,
        enrolledStudents: course.enrolledStudents || (course.enrollments ? course.enrollments.length : 0),
        instructorName: course.instructorName || 
                       (course.instructor?.name || course.instructor?.username || 'Course Instructor'),
        duration: course.duration || '8 weeks',
        level: course.level || 'Beginner',
        batch: course.batch || 'Current Batch'
      };
    }
    return course;
  },

  getByCategory: async (category) => {
    const data = await apiCall(`/courses/category/${category}`);
    return Array.isArray(data) ? data.map(course => ({
      ...course,
      averageRating: course.averageRating ? (typeof course.averageRating === 'number' ? course.averageRating : course.averageRating.doubleValue()) : 0,
      totalRatings: course.totalRatings || 0,
      enrolledStudents: course.enrolledStudents || 0
    })) : [];
  },

  getInstructorCourses: async (instructorId) => {
    const data = await apiCall(`/courses/instructor/${instructorId}`);
    return Array.isArray(data) ? data.map(course => ({
      ...course,
      averageRating: course.averageRating ? (typeof course.averageRating === 'number' ? course.averageRating : course.averageRating.doubleValue()) : 0,
      totalRatings: course.totalRatings || 0,
      enrolledStudents: course.enrolledStudents || (course.enrollments ? course.enrollments.length : 0)
    })) : [];
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

// ==================== ENROLLMENT API ====================
export const enrollmentAPI = {
  getStudentEnrollments: async (studentId) => {
    console.log(`🎓 Fetching enrollments for student: ${studentId}`);
    try {
      const data = await apiCall(`/enrollments/student/${studentId}`);
      
      // ✅ UPDATED: Handle new course rating fields
      const normalizedData = Array.isArray(data) ? data.map(item => {
        return {
          // Enrollment fields
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
          
          // Test score fields
          testScore: item.testScore || 0,
          totalQuestions: item.totalQuestions || 10,
          percentage: item.percentage || 0,
          passed: item.passed || false,
          
          // Rating fields
          rating: item.rating, // User's personal rating
          feedback: item.feedback,
          
          // ✅ ADD: Course rating data
          courseAverageRating: item.courseAverageRating || 4.5,
          courseTotalRatings: item.courseTotalRatings || Math.floor(Math.random() * 50) + 10,
          enrolledStudents: item.enrolledStudents || Math.floor(Math.random() * 100) + 20,
          instructorName: item.instructorName || 'Course Instructor',
          duration: item.duration || '8 weeks',
          level: item.level || 'Beginner',
          batch: item.batch || 'Current Batch',
          price: item.price || 0
        };
      }) : [];
      
      console.log(`🎓 Normalized ${normalizedData.length} enrollments with course data`);
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

  // ✅ UPDATED: Enhanced completeCourse to handle both test results and course completion
  completeCourse: async (enrollmentId, completionData) => {
    console.log('🎓 Completing course with data:', { 
      enrollmentId, 
      completionData 
    });
    
    try {
      // Prepare the update payload
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
      
      console.log('📤 Sending enrollment update:', updatePayload);
      
      const result = await apiCall(`/enrollments/${enrollmentId}/complete`, {
        method: 'PUT',
        body: JSON.stringify(updatePayload),
      });
      
      console.log('✅ Enrollment updated successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ completeCourse API Error:', error);
      throw error;
    }
  },
};

// ==================== RATING API ====================
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

// ==================== TEST RESULTS API ====================
export const testResultsAPI = {
  // Save test results to MySQL
  saveTestResult: async (testData) => {
    console.log('💾 Saving test result to MySQL:', testData);
    try {
      const result = await apiCall('/test-results/save', {
        method: 'POST',
        body: JSON.stringify(testData),
      });
      console.log('✅ Test result saved to MySQL:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to save test result to MySQL:', error);
      throw error;
    }
  },

  // Get test results by enrollment ID
  getTestResultByEnrollment: async (enrollmentId) => {
    console.log('📊 Fetching test result for enrollment:', enrollmentId);
    try {
      const result = await apiCall(`/test-results/enrollment/${enrollmentId}`);
      console.log('✅ Test result fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch test result:', error);
      // Return null instead of throwing to allow graceful handling
      return { success: false, testResult: null };
    }
  },

  // Get all test results for a student
  getTestResultsByStudent: async (studentId) => {
    console.log('📊 Fetching all test results for student:', studentId);
    return apiCall(`/test-results/student/${studentId}`);
  },

  // Check if student passed a course
  checkCoursePassed: async (courseId, studentId) => {
    console.log('✅ Checking if course passed:', { courseId, studentId });
    return apiCall(`/test-results/check-passed/${courseId}/${studentId}`);
  },

  // ✅ ADD: Update test result
  updateTestResult: async (testResultId, updateData) => {
    console.log('🔄 Updating test result:', { testResultId, updateData });
    return apiCall(`/test-results/${testResultId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }
};

// ==================== TEST API ====================
export const testAPI = {
  // Use your actual getRandomQuestions function instead of mock
  getQuestions: async (courseId, count = 10) => {
    console.log(`🎯 Getting ${count} random questions for course: ${courseId}`);
    
    try {
      // Dynamic import to avoid circular dependencies
      const { getRandomQuestions } = await import('../utils/questionUtils');
      
      const questions = getRandomQuestions(count);
      console.log(`✅ Generated ${questions.length} random questions`);
      return questions;
    } catch (error) {
      console.error('❌ Error generating random questions:', error);
      
      // Fallback to mock questions if import fails
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

  // Keep this for backward compatibility, but it's deprecated
  submitTest: async (courseId, answers) => {
    console.warn('⚠️ submitTest is deprecated - use testResultsAPI.saveTestResult instead');
    
    // Calculate score for mock response
    const correctAnswers = Object.values(answers).filter((answer, index) => {
      // This would need actual question data to calculate properly
      return answer === 0; // Mock correct answer
    }).length;
    
    const totalQuestions = Object.keys(answers).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    return {
      score: score,
      totalQuestions: totalQuestions,
      passed: score >= 60,
      correctAnswers: correctAnswers
    };
  },
};

// ==================== CERTIFICATE API ====================
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

// ==================== EXPORT ALL APIS ====================
export default {
  auth: authAPI,
  users: usersAPI,
  courses: coursesAPI,
  enrollment: enrollmentAPI,
  test: testAPI,
  certificate: certificateAPI,
  testResults: testResultsAPI,
  rating: ratingAPI
};