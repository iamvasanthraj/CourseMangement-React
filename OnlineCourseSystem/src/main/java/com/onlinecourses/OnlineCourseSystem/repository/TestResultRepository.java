package com.onlinecourses.OnlineCourseSystem.repository;

import com.onlinecourses.OnlineCourseSystem.entity.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestResultRepository extends JpaRepository<TestResult, Long> {
    
    // Find by enrollment ID
    Optional<TestResult> findByEnrollmentId(Long enrollmentId);
    
    // Find all test results for a student
    List<TestResult> findByStudentId(Long studentId);
    
    // Find test result for a specific course and student
    Optional<TestResult> findByCourseIdAndStudentId(Long courseId, Long studentId);
    
    // Find all test results for a course
    List<TestResult> findByCourseId(Long courseId);
    
    // Check if test result exists for enrollment
    boolean existsByEnrollmentId(Long enrollmentId);
    
    // Get test results with passing status
    @Query("SELECT tr FROM TestResult tr WHERE tr.studentId = :studentId AND tr.passed = true")
    List<TestResult> findPassedTestsByStudentId(@Param("studentId") Long studentId);
}