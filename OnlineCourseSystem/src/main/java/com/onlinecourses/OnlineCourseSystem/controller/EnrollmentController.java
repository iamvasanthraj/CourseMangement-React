package com.onlinecourses.OnlineCourseSystem.controller;

import com.onlinecourses.OnlineCourseSystem.dto.EnrollmentRequest;
import com.onlinecourses.OnlineCourseSystem.dto.EnrollmentResponse;
import com.onlinecourses.OnlineCourseSystem.dto.RatingRequest;
import com.onlinecourses.OnlineCourseSystem.entity.Enrollment;
import com.onlinecourses.OnlineCourseSystem.service.EnrollmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "http://localhost:5173")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentEnrollments(@PathVariable Long studentId) {
        try {
            System.out.println("🔍 === CONTROLLER: GET ENROLLMENTS FOR STUDENT " + studentId + " ===");
            
            List<EnrollmentResponse> enrollments = enrollmentService.getStudentEnrollments(studentId);
            System.out.println("✅ Controller: Successfully retrieved " + enrollments.size() + " enrollments");
            
            // Test JSON serialization
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            
            try {
                String json = mapper.writeValueAsString(enrollments);
                System.out.println("🔍 JSON response length: " + json.length());
                
                if (json.length() > 1000) {
                    System.out.println("🔍 First 500 chars: " + json.substring(0, 500));
                    System.out.println("🔍 Last 500 chars: " + json.substring(json.length() - 500));
                } else {
                    System.out.println("🔍 Full JSON: " + json);
                }
                
                // Validate JSON is parseable
                mapper.readValue(json, new TypeReference<List<EnrollmentResponse>>() {});
                System.out.println("✅ JSON validation passed");
                
            } catch (Exception jsonError) {
                System.out.println("💥 JSON Error: " + jsonError.getMessage());
                jsonError.printStackTrace();
                return ResponseEntity.internalServerError()
                    .body("JSON serialization error: " + jsonError.getMessage());
            }
            
            return ResponseEntity.ok(enrollments);
            
        } catch (Exception e) {
            System.out.println("💥 CONTROLLER ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body("Error loading enrollments: " + e.getMessage());
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getCourseEnrollments(@PathVariable Long courseId) {
        try {
            List<EnrollmentResponse> enrollments = enrollmentService.getCourseEnrollments(courseId);
            return ResponseEntity.ok(enrollments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/enroll")
    public ResponseEntity<?> enroll(@RequestBody EnrollmentRequest enrollmentRequest) {
        try {
            Enrollment enrollment = enrollmentService.enrollStudent(
                enrollmentRequest.getStudentId(), 
                enrollmentRequest.getCourseId()
            );
            return ResponseEntity.ok(enrollment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Enrollment failed: " + e.getMessage());
        }
    }

    @DeleteMapping("/{enrollmentId}")
    public ResponseEntity<?> unenroll(@PathVariable Long enrollmentId) {
        try {
            enrollmentService.unenrollStudent(enrollmentId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Unenrollment failed");
        }
    }

    @PutMapping("/{enrollmentId}/complete")
    public ResponseEntity<?> completeCourse(@PathVariable Long enrollmentId, @RequestBody RatingRequest ratingRequest) {
        try {
            Enrollment enrollment = enrollmentService.completeCourse(
                enrollmentId, 
                ratingRequest.getRating(), 
                ratingRequest.getFeedback()
            );
            return ResponseEntity.ok(enrollment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to complete course: " + e.getMessage());
        }
    }
}