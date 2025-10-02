package com.onlinecourses.OnlineCourseSystem.controller;

import com.onlinecourses.OnlineCourseSystem.dto.TestResultRequest;
import com.onlinecourses.OnlineCourseSystem.entity.TestResult;
import com.onlinecourses.OnlineCourseSystem.service.TestResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/test-results")
@CrossOrigin(origins = "http://localhost:3000")
public class TestResultController {
    
    @Autowired
    private TestResultService testResultService;
    
    // Save test result
    @PostMapping("/save")
    public ResponseEntity<?> saveTestResult(@RequestBody TestResultRequest request) {
        try {
            System.out.println("💾 Saving test result: " + request);
            
            // Create entity from request
            TestResult testResult = new TestResult(
                request.getEnrollmentId(),
                request.getCourseId(),
                request.getStudentId(),
                request.getTestScore(),
                request.getTotalQuestions(),
                request.getPercentage(),
                request.getPassed()
            );
            
            // Save to database
            TestResult savedResult = testResultService.saveTestResult(testResult);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test results saved successfully");
            response.put("testResult", savedResult);
            
            System.out.println("✅ Test result saved: " + savedResult.getId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error saving test result: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to save test results: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get test result by enrollment ID
    @GetMapping("/enrollment/{enrollmentId}")
    public ResponseEntity<?> getTestResultByEnrollment(@PathVariable Long enrollmentId) {
        try {
            Optional<TestResult> testResult = testResultService.getTestResultByEnrollmentId(enrollmentId);
            
            Map<String, Object> response = new HashMap<>();
            if (testResult.isPresent()) {
                response.put("success", true);
                response.put("testResult", testResult.get());
            } else {
                response.put("success", false);
                response.put("message", "No test result found for this enrollment");
            }
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get all test results for a student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getTestResultsByStudent(@PathVariable Long studentId) {
        try {
            List<TestResult> testResults = testResultService.getTestResultsByStudentId(studentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("testResults", testResults);
            response.put("count", testResults.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Check if student passed a course
    @GetMapping("/check-passed/{courseId}/{studentId}")
    public ResponseEntity<?> checkCoursePassed(@PathVariable Long courseId, @PathVariable Long studentId) {
        try {
            boolean passed = testResultService.hasPassedCourse(courseId, studentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("courseId", courseId);
            response.put("studentId", studentId);
            response.put("passed", passed);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}