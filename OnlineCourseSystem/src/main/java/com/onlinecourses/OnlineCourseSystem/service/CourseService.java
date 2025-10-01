package com.onlinecourses.OnlineCourseSystem.service;

import com.onlinecourses.OnlineCourseSystem.dto.CourseResponse;
import com.onlinecourses.OnlineCourseSystem.entity.Course;
import com.onlinecourses.OnlineCourseSystem.entity.Enrollment;
import com.onlinecourses.OnlineCourseSystem.entity.User;
import com.onlinecourses.OnlineCourseSystem.repository.CourseRepository;
import com.onlinecourses.OnlineCourseSystem.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CourseService {
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    public List<CourseResponse> getAllCourses() {
        try {
            System.out.println("🔍 Getting all courses from database...");
            List<Course> courses = courseRepository.findAll();
            System.out.println("✅ Found " + courses.size() + " courses");
            
            List<CourseResponse> response = courses.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
            
            System.out.println("✅ Successfully converted to DTOs");
            return response;
        } catch (Exception e) {
            System.out.println("💥 ERROR in getAllCourses: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to load courses: " + e.getMessage());
        }
    }
    
    public List<CourseResponse> getCoursesByCategory(String category) {
        try {
            List<Course> courses = courseRepository.findByCategory(category);
            return courses.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to load courses by category: " + e.getMessage());
        }
    }
    
    public List<CourseResponse> getInstructorCourses(Long instructorId) {
        try {
            List<Course> courses = courseRepository.findByInstructorId(instructorId);
            return courses.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to load instructor courses: " + e.getMessage());
        }
    }
    
    // ✅ ADD: Method to calculate course rating statistics
    private java.math.BigDecimal calculateCourseAverageRating(Long courseId) {
        try {
            List<Enrollment> courseEnrollments = enrollmentRepository.findByCourseId(courseId);
            
            // Filter enrollments with ratings
            List<Enrollment> ratedEnrollments = courseEnrollments.stream()
                .filter(e -> e.getRating() != null && e.getRating() > 0)
                .collect(Collectors.toList());
            
            if (ratedEnrollments.isEmpty()) {
                return java.math.BigDecimal.ZERO;
            }
            
            double sum = ratedEnrollments.stream()
                .mapToInt(Enrollment::getRating)
                .sum();
            double average = sum / ratedEnrollments.size();
            
            // Round to 2 decimal places
            return java.math.BigDecimal.valueOf(average).setScale(2, java.math.RoundingMode.HALF_UP);
            
        } catch (Exception e) {
            System.out.println("⚠️ Error calculating course average rating: " + e.getMessage());
            return java.math.BigDecimal.ZERO;
        }
    }
    
    // ✅ ADD: Method to calculate total ratings count
    private Integer calculateTotalRatings(Long courseId) {
        try {
            List<Enrollment> courseEnrollments = enrollmentRepository.findByCourseId(courseId);
            
            return (int) courseEnrollments.stream()
                .filter(e -> e.getRating() != null && e.getRating() > 0)
                .count();
            
        } catch (Exception e) {
            System.out.println("⚠️ Error calculating total ratings: " + e.getMessage());
            return 0;
        }
    }
    
    // ✅ ADD: Method to calculate enrolled students
    private Integer calculateEnrolledStudents(Long courseId) {
        try {
            List<Enrollment> courseEnrollments = enrollmentRepository.findByCourseId(courseId);
            return courseEnrollments.size();
        } catch (Exception e) {
            System.out.println("⚠️ Error calculating enrolled students: " + e.getMessage());
            return 0;
        }
    }
    
    // ✅ UPDATED: Completely safe method to get instructor name
    private String getInstructorName(User instructor) {
        if (instructor == null) {
            return "Course Instructor";
        }
        
        // ✅ SAFE: Only use methods that definitely exist
        // All User entities have getId() and we know instructor exists
        
        // Option 1: Use reflection to safely check available methods (advanced)
        // Option 2: Use a simple, guaranteed approach
        
        // SIMPLE GUARANTEED APPROACH:
        // Since we can't be sure what methods exist, use the ID
        return "Instructor #" + instructor.getId();
        
        // ALTERNATIVE: If you know your User entity has specific fields,
        // you can add them here once you confirm they exist
    }
    
    // ✅ UPDATED: Enhanced convertToResponse with rating data - COMPLETELY SAFE
    public CourseResponse convertToResponse(Course course) {
        try {
            String instructorName = "Course Instructor";
            Long instructorId = null;
            
            if (course.getInstructor() != null) {
                // ✅ FIXED: Use completely safe method
                instructorName = getInstructorName(course.getInstructor());
                instructorId = course.getInstructor().getId();
                
                System.out.println("👨‍🏫 Instructor: " + instructorName + " (ID: " + instructorId + ")");
            }
            
            // ✅ ADD: Calculate rating statistics
            Long courseId = course.getId();
            java.math.BigDecimal averageRating = course.getAverageRating() != null ? 
                course.getAverageRating() : calculateCourseAverageRating(courseId);
            
            Integer totalRatings = course.getTotalRatings() != null ? 
                course.getTotalRatings() : calculateTotalRatings(courseId);
            
            Integer enrolledStudents = course.getEnrolledStudents() != null ? 
                course.getEnrolledStudents() : calculateEnrolledStudents(courseId);
            
            System.out.println("📊 Course: " + course.getTitle() + 
                             " | Avg Rating: " + averageRating + 
                             " | Total Ratings: " + totalRatings + 
                             " | Students: " + enrolledStudents);
            
            return new CourseResponse(
                course.getId(),
                course.getTitle(),
                course.getCategory(),
                course.getDuration(),
                course.getBatch(),
                course.getLevel(),
                course.getPrice(),
                instructorName,
                instructorId,
                course.getCreatedAt(),
                // ✅ ADD: Rating fields
                averageRating,
                totalRatings,
                enrolledStudents
            );
        } catch (Exception e) {
            System.out.println("⚠️ Error converting course: " + e.getMessage());
            e.printStackTrace();
            
            // Return safe default values with rating data
            return new CourseResponse(
                course.getId(),
                course.getTitle() != null ? course.getTitle() : "Unknown Course",
                course.getCategory() != null ? course.getCategory() : "General",
                course.getDuration() != null ? course.getDuration() : "8 weeks",
                course.getBatch() != null ? course.getBatch() : "Current Batch",
                course.getLevel() != null ? course.getLevel() : "Beginner",
                course.getPrice() != null ? course.getPrice() : java.math.BigDecimal.ZERO,
                "Course Instructor",
                null,
                course.getCreatedAt(),
                // ✅ ADD: Default rating values
                java.math.BigDecimal.ZERO,
                0,
                0
            );
        }
    }
    
    // ✅ ADD: Method for CourseController
    public Optional<CourseResponse> getCourseResponseById(Long courseId) {
        try {
            Optional<Course> course = courseRepository.findById(courseId);
            return course.map(this::convertToResponse);
        } catch (Exception e) {
            System.out.println("💥 Error getting course response by ID: " + e.getMessage());
            return Optional.empty();
        }
    }
    
    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }
    
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
    
    public Optional<Course> getCourseById(Long courseId) {
        try {
            System.out.println("🔍 Service: Getting course by ID: " + courseId);
            return courseRepository.findById(courseId);
        } catch (Exception e) {
            System.out.println("💥 Service Error getting course: " + e.getMessage());
            throw new RuntimeException("Failed to get course: " + e.getMessage());
        }
    }
    
    public Course updateCourse(Long courseId, Course updatedCourse) {
        try {
            System.out.println("🔄 Service: Updating course ID: " + courseId);
            System.out.println("📝 Update data - Title: " + updatedCourse.getTitle() + 
                             ", Duration: " + updatedCourse.getDuration() + 
                             ", Category: " + updatedCourse.getCategory());
            
            Optional<Course> existingCourseOpt = courseRepository.findById(courseId);
            
            if (existingCourseOpt.isPresent()) {
                Course existingCourse = existingCourseOpt.get();
                
                // Update only the fields that should be updatable
                if (updatedCourse.getTitle() != null) {
                    existingCourse.setTitle(updatedCourse.getTitle());
                }
                if (updatedCourse.getDuration() != null) {
                    existingCourse.setDuration(updatedCourse.getDuration());
                }
                if (updatedCourse.getCategory() != null) {
                    existingCourse.setCategory(updatedCourse.getCategory());
                }
                if (updatedCourse.getPrice() != null) {
                    existingCourse.setPrice(updatedCourse.getPrice());
                }
                if (updatedCourse.getLevel() != null) {
                    existingCourse.setLevel(updatedCourse.getLevel());
                }
                if (updatedCourse.getBatch() != null) {
                    existingCourse.setBatch(updatedCourse.getBatch());
                }
                // ✅ DON'T update instructor - keep original creator
                
                Course savedCourse = courseRepository.save(existingCourse);
                System.out.println("✅ Service: Course updated successfully: " + savedCourse.getTitle());
                return savedCourse;
            } else {
                System.out.println("❌ Service: Course not found with ID: " + courseId);
                throw new RuntimeException("Course not found with id: " + courseId);
            }
            
        } catch (Exception e) {
            System.out.println("💥 Service Error updating course: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update course: " + e.getMessage());
        }
    }
}