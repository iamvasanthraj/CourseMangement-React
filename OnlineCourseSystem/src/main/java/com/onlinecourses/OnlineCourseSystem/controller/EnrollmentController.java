package com.onlinecourses.OnlineCourseSystem.controller;

import com.onlinecourses.OnlineCourseSystem.dto.CourseEnrollmentDto;
import com.onlinecourses.OnlineCourseSystem.dto.EnrollmentResponseDto;
import com.onlinecourses.OnlineCourseSystem.entity.Course;
import com.onlinecourses.OnlineCourseSystem.entity.Enrollment;
import com.onlinecourses.OnlineCourseSystem.service.CourseService;
import com.onlinecourses.OnlineCourseSystem.service.EnrollmentService;
import com.onlinecourses.OnlineCourseSystem.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "http://localhost:5173")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @Autowired
    private CourseService courseService;

    @PostMapping("/enroll")
    public ResponseEntity<?> enrollStudent(@RequestBody Map<String, Long> request) {
        try {
            Long studentId = request.get("studentId");
            Long courseId = request.get("courseId");
            
            Enrollment enrollment = enrollmentService.enrollStudent(studentId, courseId);
            
            // Create response DTO
            Course course = courseService.getCourseById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
            
            EnrollmentResponseDto response = new EnrollmentResponseDto(
                enrollment.getId(),
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getCategory(),
                course.getInstructorName(),
                course.getRating(),
                course.getPrice(),
                enrollment.isCompleted(),
                enrollment.getEnrollmentDate(),
                course.getTotalRatings(),
                course.getBatch()
            );
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<EnrollmentResponseDto>> getStudentEnrollments(@PathVariable Long studentId) {
        try {
            List<Enrollment> enrollments = enrollmentService.getEnrollmentsByStudent(studentId);
            
            List<EnrollmentResponseDto> response = enrollments.stream().map(enrollment -> {
                Course course = courseService.getCourseById(enrollment.getCourseId())
                    .orElse(new Course()); // Fallback course
                
                return new EnrollmentResponseDto(
                    enrollment.getId(),
                    course.getId(),
                    course.getTitle(),
                    course.getDescription(),
                    course.getCategory(),
                    course.getInstructorName(),
                    course.getRating(),
                    course.getPrice(),
                    enrollment.isCompleted(),
                    enrollment.getEnrollmentDate(),
                    course.getTotalRatings(),
                    course.getBatch()
                );
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @Autowired
private UserService userService;


    @GetMapping("/course/{courseId}")
public ResponseEntity<List<CourseEnrollmentDto>> getCourseEnrollments(@PathVariable Long courseId) {
    try {
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByCourse(courseId);
        
        Course course = courseService.getCourseById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));
        
        List<CourseEnrollmentDto> response = enrollments.stream().map(enrollment -> {
            // You could add logic here to fetch actual student names if available
            String studentName = generateStudentName(enrollment.getStudentId());
            
            return new CourseEnrollmentDto(
                enrollment.getId(),
                enrollment.getStudentId(),
                enrollment.getCourseId(),
                enrollment.getEnrollmentDate(),
                enrollment.isCompleted(),
                enrollment.getCompletionDate(),
                course.getTitle(),
                course.getCategory(),
                course.getInstructorName(),
                studentName
            );
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        return ResponseEntity.internalServerError().build();
    }
}

private String generateStudentName(Long studentId) {
    // If you have access to user service, you could fetch real names here
    // For now, return the placeholder
    return "Student #" + studentId;
}

    @PutMapping("/{enrollmentId}/complete")
    public ResponseEntity<?> markAsCompleted(@PathVariable Long enrollmentId) {
        try {
            Enrollment updatedEnrollment = enrollmentService.markAsCompleted(enrollmentId);
            return ResponseEntity.ok(updatedEnrollment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{enrollmentId}")
    public ResponseEntity<?> unenrollStudent(@PathVariable Long enrollmentId) {
        try {
            enrollmentService.unenrollStudent(enrollmentId);
            return ResponseEntity.ok().body("Student unenrolled successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{enrollmentId}/details")
    public ResponseEntity<?> getEnrollmentDetails(@PathVariable Long enrollmentId) {
        try {
            Enrollment enrollment = enrollmentService.getEnrollmentById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
            
            Course course = courseService.getCourseById(enrollment.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
            
            EnrollmentResponseDto response = new EnrollmentResponseDto(
                enrollment.getId(),
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getCategory(),
                course.getInstructorName(),
                course.getRating(),
                course.getPrice(),
                enrollment.isCompleted(),
                enrollment.getEnrollmentDate(),
                course.getTotalRatings(),
                course.getBatch()
            );
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}