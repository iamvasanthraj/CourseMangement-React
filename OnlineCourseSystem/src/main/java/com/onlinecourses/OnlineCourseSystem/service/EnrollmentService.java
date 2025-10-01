package com.onlinecourses.OnlineCourseSystem.service;

import com.onlinecourses.OnlineCourseSystem.dto.EnrollmentRequest;
import com.onlinecourses.OnlineCourseSystem.dto.EnrollmentResponse;
import com.onlinecourses.OnlineCourseSystem.dto.RatingRequest;
import com.onlinecourses.OnlineCourseSystem.entity.Enrollment;
import com.onlinecourses.OnlineCourseSystem.entity.User;
import com.onlinecourses.OnlineCourseSystem.entity.Course;
import com.onlinecourses.OnlineCourseSystem.repository.EnrollmentRepository;
import com.onlinecourses.OnlineCourseSystem.repository.UserRepository;
import com.onlinecourses.OnlineCourseSystem.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    public List<EnrollmentResponse> getStudentEnrollments(Long studentId) {
        try {
            System.out.println("🔍 Getting enrollments for student ID: " + studentId);
            List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
            System.out.println("✅ Found " + enrollments.size() + " enrollments");
            
            return enrollments.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.out.println("💥 ERROR in getStudentEnrollments: " + e.getMessage());
            throw new RuntimeException("Failed to get student enrollments: " + e.getMessage());
        }
    }
    
    public List<EnrollmentResponse> getCourseEnrollments(Long courseId) {
        try {
            List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
            return enrollments.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to get course enrollments: " + e.getMessage());
        }
    }
    
    // ✅ ADD: Method to calculate course rating statistics
    private Map<String, Object> calculateCourseRatingStats(Long courseId) {
        try {
            List<Enrollment> courseEnrollments = enrollmentRepository.findByCourseId(courseId);
            
            // Filter enrollments with ratings
            List<Enrollment> ratedEnrollments = courseEnrollments.stream()
                .filter(e -> e.getRating() != null && e.getRating() > 0)
                .collect(Collectors.toList());
            
            int totalRatings = ratedEnrollments.size();
            double averageRating = 0.0;
            
            if (totalRatings > 0) {
                double sum = ratedEnrollments.stream()
                    .mapToInt(Enrollment::getRating)
                    .sum();
                averageRating = Math.round((sum / totalRatings) * 10.0) / 10.0; // Round to 1 decimal
            }
            
            int enrolledStudents = courseEnrollments.size();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("averageRating", averageRating);
            stats.put("totalRatings", totalRatings);
            stats.put("enrolledStudents", enrolledStudents);
            
            System.out.println("📊 Course " + courseId + " Stats - Avg: " + averageRating + 
                             ", Total Ratings: " + totalRatings + ", Students: " + enrolledStudents);
            
            return stats;
            
        } catch (Exception e) {
            System.out.println("⚠️ Error calculating course stats: " + e.getMessage());
            // Return safe defaults
            Map<String, Object> stats = new HashMap<>();
            stats.put("averageRating", 0.0);
            stats.put("totalRatings", 0);
            stats.put("enrolledStudents", 0);
            return stats;
        }
    }
    
    // ✅ UPDATED: Enhanced conversion with course data - FIXED getUsername() issue
    private EnrollmentResponse convertToResponse(Enrollment enrollment) {
        try {
            System.out.println("🔍 Converting enrollment: " + enrollment.getId());
            
            // Safe approach - only use methods we know exist
            Long studentId = enrollment.getStudent() != null ? enrollment.getStudent().getId() : null;
            Long courseId = enrollment.getCourse() != null ? enrollment.getCourse().getId() : null;
            String courseTitle = enrollment.getCourse() != null ? enrollment.getCourse().getTitle() : "Unknown Course";
            String courseCategory = enrollment.getCourse() != null ? enrollment.getCourse().getCategory() : "Unknown";
            
            // Use student ID for name to avoid method issues
            String studentName = studentId != null ? "Student #" + studentId : "Unknown Student";
            
            // ✅ FIXED: Get instructor name safely
            String instructorName = "Unknown Instructor";
            String duration = "Unknown Duration";
            String level = "Unknown Level";
            String batch = "Unknown Batch";
            Double price = 0.0;
            
            if (enrollment.getCourse() != null) {
                Course course = enrollment.getCourse();
                
                // ✅ FIX: Use getName() or getEmail() instead of getUsername()
                if (course.getInstructor() != null) {
                    User instructor = course.getInstructor();
                    // Try common user field names
                    if (instructor.getName() != null) {
                        instructorName = instructor.getName();
                    } else if (instructor.getEmail() != null) {
                        instructorName = instructor.getEmail().split("@")[0]; // Use email prefix as name
                    } else {
                        instructorName = "Instructor #" + instructor.getId();
                    }
                }
                
                duration = course.getDuration() != null ? course.getDuration() : "8 weeks";
                level = course.getLevel() != null ? course.getLevel() : "Beginner";
                batch = course.getBatch() != null ? course.getBatch() : "Current Batch";
                price = course.getPrice() != null ? course.getPrice().doubleValue() : 0.0;
            }
            
            // ✅ ADD: Calculate course rating statistics
            Map<String, Object> courseStats = calculateCourseRatingStats(courseId);
            Double courseAverageRating = (Double) courseStats.get("averageRating");
            Integer courseTotalRatings = (Integer) courseStats.get("totalRatings");
            Integer enrolledStudents = (Integer) courseStats.get("enrolledStudents");
            
            System.out.println("🔍 Course Stats - Avg: " + courseAverageRating + ", Total: " + courseTotalRatings + ", Students: " + enrolledStudents);
            
            // Create enhanced response with course stats
            EnrollmentResponse response = new EnrollmentResponse(
                enrollment.getId(),
                studentId,
                studentName,
                courseId,
                courseTitle,
                courseCategory,
                enrollment.getEnrollmentDate(),
                enrollment.getCompletionDate(),
                enrollment.isCompleted(),
                enrollment.getRating(), // User's personal rating
                enrollment.getFeedback(),
                courseAverageRating,
                courseTotalRatings,
                enrolledStudents,
                instructorName,
                duration,
                level,
                batch,
                price
            );
            
            System.out.println("✅ Created enhanced response: " + response);
            return response;
            
        } catch (Exception e) {
            System.out.println("💥 Error converting enrollment " + enrollment.getId() + ": " + e.getMessage());
            e.printStackTrace();
            
            // Return safe default with basic data
            return new EnrollmentResponse(
                enrollment.getId(),
                null,
                "Unknown Student",
                null,
                "Unknown Course",
                "Unknown",
                enrollment.getEnrollmentDate(),
                null,
                false,
                null,
                null,
                0.0, 0, 0, "Unknown Instructor", "Unknown Duration", "Unknown Level", "Unknown Batch", 0.0
            );
        }
    }
    
    // ✅ UPDATED: Complete course with rating - also update course stats
    public Enrollment completeCourse(Long enrollmentId, Integer rating, String feedback) {
        try {
            Optional<Enrollment> enrollmentOpt = enrollmentRepository.findById(enrollmentId);
            if (enrollmentOpt.isPresent()) {
                Enrollment enrollment = enrollmentOpt.get();
                enrollment.setCompleted(true);
                enrollment.setCompletionDate(LocalDateTime.now());
                enrollment.setRating(rating);
                enrollment.setFeedback(feedback);
                
                Enrollment updatedEnrollment = enrollmentRepository.save(enrollment);
                
                // ✅ ADD: Update course rating statistics
                updateCourseRatingStats(enrollment.getCourse().getId());
                
                return updatedEnrollment;
            }
            throw new RuntimeException("Enrollment not found");
        } catch (Exception e) {
            throw new RuntimeException("Failed to complete course: " + e.getMessage());
        }
    }
    
    // ✅ ADD: Method to update course rating statistics in Course entity
    private void updateCourseRatingStats(Long courseId) {
        try {
            Optional<Course> courseOpt = courseRepository.findById(courseId);
            if (courseOpt.isPresent()) {
                Course course = courseOpt.get();
                Map<String, Object> stats = calculateCourseRatingStats(courseId);
                
                Double averageRating = (Double) stats.get("averageRating");
                Integer totalRatings = (Integer) stats.get("totalRatings");
                
                course.setAverageRating(java.math.BigDecimal.valueOf(averageRating));
                course.setTotalRatings(totalRatings);
                
                courseRepository.save(course);
                
                System.out.println("✅ Updated course " + courseId + " ratings - Avg: " + averageRating + ", Total: " + totalRatings);
            }
        } catch (Exception e) {
            System.out.println("⚠️ Failed to update course rating stats: " + e.getMessage());
        }
    }
    
    // ... rest of the existing methods remain the same ...
    public Enrollment enrollStudent(Long studentId, Long courseId) {
        try {
            Optional<User> student = userRepository.findById(studentId);
            Optional<Course> course = courseRepository.findById(courseId);
            
            if (student.isPresent() && course.isPresent()) {
                // Check if already enrolled
                Optional<Enrollment> existingEnrollment = enrollmentRepository
                    .findByStudentAndCourse(student.get(), course.get());
                
                if (existingEnrollment.isPresent()) {
                    return existingEnrollment.get();
                }
                
                Enrollment enrollment = new Enrollment(student.get(), course.get());
                return enrollmentRepository.save(enrollment);
            }
            throw new RuntimeException("Student or course not found");
        } catch (Exception e) {
            throw new RuntimeException("Enrollment failed: " + e.getMessage());
        }
    }
    
    public void unenrollStudent(Long enrollmentId) {
        try {
            enrollmentRepository.deleteById(enrollmentId);
        } catch (Exception e) {
            throw new RuntimeException("Unenrollment failed: " + e.getMessage());
        }
    }
}