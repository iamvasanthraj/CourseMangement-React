package com.onlinecourses.OnlineCourseSystem.controller;

import com.onlinecourses.OnlineCourseSystem.entity.Enrollment;
import com.onlinecourses.OnlineCourseSystem.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "http://localhost:5173")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @PostMapping("/enroll")
    public ResponseEntity<?> enrollStudent(@RequestBody Map<String, Long> request) {
        try {
            Long studentId = request.get("studentId");
            Long courseId = request.get("courseId");
            
            Enrollment enrollment = enrollmentService.enrollStudent(studentId, courseId);
            return ResponseEntity.ok(enrollment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/student/{studentId}")
    public List<Enrollment> getStudentEnrollments(@PathVariable Long studentId) {
        return enrollmentService.getEnrollmentsByStudent(studentId);
    }

    @GetMapping("/course/{courseId}")
    public List<Enrollment> getCourseEnrollments(@PathVariable Long courseId) {
        return enrollmentService.getEnrollmentsByCourse(courseId);
    }

    @PostMapping("/{enrollmentId}/complete")
    public ResponseEntity<?> markAsCompleted(@PathVariable Long enrollmentId) {
        try {
            enrollmentService.markAsCompleted(enrollmentId);
            return ResponseEntity.ok().body("Course marked as completed");
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
}