package com.onlinecourses.OnlineCourseSystem.service;

import com.onlinecourses.OnlineCourseSystem.entity.TestResult;
import com.onlinecourses.OnlineCourseSystem.repository.TestResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TestResultService {
    
    @Autowired
    private TestResultRepository testResultRepository;
    
    // Save or update test result
    public TestResult saveTestResult(TestResult testResult) {
        // Check if test result already exists for this enrollment
        Optional<TestResult> existingResult = testResultRepository.findByEnrollmentId(testResult.getEnrollmentId());
        
        if (existingResult.isPresent()) {
            // Update existing result
            TestResult existing = existingResult.get();
            existing.setTestScore(testResult.getTestScore());
            existing.setTotalQuestions(testResult.getTotalQuestions());
            existing.setPercentage(testResult.getPercentage());
            existing.setPassed(testResult.getPassed());
            existing.setCompleted(testResult.getCompleted());
            return testResultRepository.save(existing);
        } else {
            // Create new result
            return testResultRepository.save(testResult);
        }
    }
    
    // Get test result by enrollment ID
    public Optional<TestResult> getTestResultByEnrollmentId(Long enrollmentId) {
        return testResultRepository.findByEnrollmentId(enrollmentId);
    }
    
    // Get all test results for a student
    public List<TestResult> getTestResultsByStudentId(Long studentId) {
        return testResultRepository.findByStudentId(studentId);
    }
    
    // Get test result for specific course and student
    public Optional<TestResult> getTestResultByCourseAndStudent(Long courseId, Long studentId) {
        return testResultRepository.findByCourseIdAndStudentId(courseId, studentId);
    }
    
    // Check if student passed a specific course
    public boolean hasPassedCourse(Long courseId, Long studentId) {
        Optional<TestResult> result = testResultRepository.findByCourseIdAndStudentId(courseId, studentId);
        return result.isPresent() && result.get().getPassed();
    }
    
    // Delete test result
    public void deleteTestResult(Long id) {
        testResultRepository.deleteById(id);
    }
}