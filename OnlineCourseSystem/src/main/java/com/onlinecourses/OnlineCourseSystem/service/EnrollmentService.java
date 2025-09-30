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
import java.util.List;
import java.util.Optional;
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
            
            System.out.println("🔍 Student: " + studentId + " - " + studentName);
            System.out.println("🔍 Course: " + courseId + " - " + courseTitle);
            
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
                enrollment.getRating(),
                enrollment.getFeedback()
            );
            
            System.out.println("✅ Created response: " + response);
            return response;
            
        } catch (Exception e) {
            System.out.println("💥 Error converting enrollment " + enrollment.getId() + ": " + e.getMessage());
            e.printStackTrace();
            
            // Return safe default
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
                null
            );
        }
    }
    
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
    
    public Enrollment completeCourse(Long enrollmentId, Integer rating, String feedback) {
        try {
            Optional<Enrollment> enrollmentOpt = enrollmentRepository.findById(enrollmentId);
            if (enrollmentOpt.isPresent()) {
                Enrollment enrollment = enrollmentOpt.get();
                enrollment.setCompleted(true);
                enrollment.setCompletionDate(LocalDateTime.now());
                enrollment.setRating(rating);
                enrollment.setFeedback(feedback);
                return enrollmentRepository.save(enrollment);
            }
            throw new RuntimeException("Enrollment not found");
        } catch (Exception e) {
            throw new RuntimeException("Failed to complete course: " + e.getMessage());
        }
    }
}