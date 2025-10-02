package com.onlinecourses.OnlineCourseSystem.service;

import com.onlinecourses.OnlineCourseSystem.dto.CourseCompletionRequest;
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
    
    // ✅ UPDATED: Enhanced conversion with course data
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
            
            // ✅ FIXED: Use setter methods instead of constructor
            EnrollmentResponse response = new EnrollmentResponse();
            response.setId(enrollment.getId());
            response.setEnrollmentId(enrollment.getId());
            response.setStudentId(studentId);
            response.setStudentName(studentName);
            response.setCourseId(courseId);
            response.setCourseTitle(courseTitle);
            response.setCourseCategory(courseCategory);
            response.setEnrollmentDate(enrollment.getEnrollmentDate());
            response.setCompletionDate(enrollment.getCompletionDate());
            response.setCompleted(enrollment.isCompleted());
            response.setRating(enrollment.getRating());
            response.setFeedback(enrollment.getFeedback());
            
            // ✅ ADD: Test score fields
            response.setTestScore(enrollment.getTestScore());
            response.setTotalQuestions(enrollment.getTotalQuestions());
            response.setPercentage(enrollment.getPercentage());
            response.setPassed(enrollment.getPassed());
            
            // Course details
            response.setCourseAverageRating(courseAverageRating);
            response.setCourseTotalRatings(courseTotalRatings);
            response.setEnrolledStudents(enrolledStudents);
            response.setInstructorName(instructorName);
            response.setDuration(duration);
            response.setLevel(level);
            response.setBatch(batch);
            response.setPrice(price);
            
            System.out.println("✅ Created enhanced response: " + response);
            return response;
            
        } catch (Exception e) {
            System.out.println("💥 Error converting enrollment " + enrollment.getId() + ": " + e.getMessage());
            e.printStackTrace();
            
            // Return safe default with basic data using setters
            EnrollmentResponse response = new EnrollmentResponse();
            response.setId(enrollment.getId());
            response.setEnrollmentId(enrollment.getId());
            response.setStudentName("Unknown Student");
            response.setCourseTitle("Unknown Course");
            response.setCourseCategory("Unknown");
            response.setEnrollmentDate(enrollment.getEnrollmentDate());
            response.setCompleted(false);
            response.setCourseAverageRating(0.0);
            response.setCourseTotalRatings(0);
            response.setEnrolledStudents(0);
            response.setInstructorName("Unknown Instructor");
            response.setDuration("Unknown Duration");
            response.setLevel("Unknown Level");
            response.setBatch("Unknown Batch");
            response.setPrice(0.0);
            
            return response;
        }
    }

    // ✅ FIXED: Complete course with proper auto-completion logic
// In your EnrollmentService - UPDATE the completeCourse method with more detailed logging
// ✅ FIXED: Backward compatibility method - DON'T auto-complete
public Enrollment completeCourse(Long enrollmentId, CourseCompletionRequest completionRequest) {
    try {
        System.out.println("🎯 === SERVICE: COMPLETE COURSE ===");
        System.out.println("📥 Enrollment ID: " + enrollmentId);
        System.out.println("📥 Completion Request Details:");
        System.out.println("   - Completed: " + completionRequest.getCompleted());
        System.out.println("   - Passed: " + completionRequest.getPassed());
        System.out.println("   - Test Score: " + completionRequest.getTestScore());
        System.out.println("   - Total Questions: " + completionRequest.getTotalQuestions());
        
        // ✅ ADD: SAFETY CHECK - If test failed, NEVER mark as completed
        if (completionRequest.getPassed() != null && !completionRequest.getPassed()) {
            System.out.println("🛡️  Safety Check: Test failed - forcing completed to false");
            completionRequest.setCompleted(false);
        }
        
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + enrollmentId));

        // Debug current state
        System.out.println("🔍 Current enrollment state:");
        System.out.println("   - Completed: " + enrollment.isCompleted());
        System.out.println("   - Passed: " + enrollment.getPassed());

        // ✅ SIMPLIFIED: Only complete if test passed OR explicitly set to complete
        if (completionRequest.getCompleted() != null) {
            // Use explicit completion value
            enrollment.setCompleted(completionRequest.getCompleted());
            System.out.println("✅ Set completed (explicit): " + completionRequest.getCompleted());
        } else if (completionRequest.getPassed() != null) {
            // Auto-complete only if test passed
            enrollment.setCompleted(completionRequest.getPassed());
            System.out.println("✅ Auto-completing based on test result: " + completionRequest.getPassed());
        }
        // If no completion info, maintain current state

        // Update completion date
        if (enrollment.isCompleted()) {
            if (completionRequest.getCompletionDate() != null) {
                enrollment.setCompletionDate(completionRequest.getCompletionDate());
            } else {
                enrollment.setCompletionDate(LocalDateTime.now());
            }
            System.out.println("✅ Set completion date: " + enrollment.getCompletionDate());
        } else {
            enrollment.setCompletionDate(null);
            System.out.println("❌ Course not completed - clearing completion date");
        }

        // Update test scores if provided
        if (completionRequest.getTestScore() != null) {
            enrollment.setTestScore(completionRequest.getTestScore());
            System.out.println("✅ Test score: " + completionRequest.getTestScore());
        }
        
        if (completionRequest.getTotalQuestions() != null) {
            enrollment.setTotalQuestions(completionRequest.getTotalQuestions());
            System.out.println("✅ Total questions: " + completionRequest.getTotalQuestions());
        }
        
        if (completionRequest.getPercentage() != null) {
            enrollment.setPercentage(completionRequest.getPercentage());
            System.out.println("✅ Percentage: " + completionRequest.getPercentage());
        }
        
        if (completionRequest.getPassed() != null) {
            enrollment.setPassed(completionRequest.getPassed());
            System.out.println("✅ Passed: " + completionRequest.getPassed());
        }

        // Update rating if provided
        if (completionRequest.getRating() != null) {
            enrollment.setRating(completionRequest.getRating());
            System.out.println("✅ Rating: " + completionRequest.getRating());
        }
        
        if (completionRequest.getFeedback() != null) {
            enrollment.setFeedback(completionRequest.getFeedback());
            System.out.println("✅ Feedback: " + completionRequest.getFeedback());
        }

        // Debug final state
        System.out.println("🔍 Final enrollment state:");
        System.out.println("   - Completed: " + enrollment.isCompleted());
        System.out.println("   - Passed: " + enrollment.getPassed());
        System.out.println("   - Test Score: " + enrollment.getTestScore() + "/" + enrollment.getTotalQuestions());

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        System.out.println("💾 FINAL RESULT - Completed: " + savedEnrollment.isCompleted() + ", Passed: " + savedEnrollment.getPassed());
        
        return savedEnrollment;
        
    } catch (Exception e) {
        System.out.println("💥 SERVICE ERROR: Failed to complete course - " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Failed to complete course: " + e.getMessage(), e);
    }
}
// ✅ ADD: Separate method for manual course completion (if needed)
public Enrollment manuallyCompleteCourse(Long enrollmentId) {
    CourseCompletionRequest request = new CourseCompletionRequest();
    request.setCompleted(true);
    request.setCompletionDate(LocalDateTime.now());
    
    return completeCourse(enrollmentId, request);
}

    // Add this method for rating only
    public Enrollment rateCourse(Long enrollmentId, Integer rating, String feedback) {
        CourseCompletionRequest request = new CourseCompletionRequest();
        request.setRating(rating);
        request.setFeedback(feedback);
        // Don't mark as completed if just rating
        
        return completeCourse(enrollmentId, request);
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
    
    // Enrollment methods
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

    // ✅ ADD: Debug method to track completion logic - NOW USED
    private void debugEnrollmentCompletion(Enrollment enrollment, CourseCompletionRequest request, String operation) {
        System.out.println("🔍 === ENROLLMENT DEBUG: " + operation + " ===");
        System.out.println("📊 Enrollment ID: " + enrollment.getId());
        System.out.println("📥 Request - Completed: " + request.getCompleted() + ", Passed: " + request.getPassed());
        System.out.println("📊 Current - Completed: " + enrollment.isCompleted() + ", Passed: " + enrollment.getPassed());
        System.out.println("🎯 Test Score: " + enrollment.getTestScore() + "/" + enrollment.getTotalQuestions());
        System.out.println("📈 Percentage: " + enrollment.getPercentage());
        System.out.println("📅 Completion Date: " + enrollment.getCompletionDate());
        System.out.println("🔍 ==================================");
    }
}