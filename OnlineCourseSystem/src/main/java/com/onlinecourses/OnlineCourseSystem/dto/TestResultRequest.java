package com.onlinecourses.OnlineCourseSystem.dto;

public class TestResultRequest {
    private Long enrollmentId;
    private Long courseId;
    private Long studentId;
    private Integer testScore;
    private Integer totalQuestions;
    private Double percentage;
    private Boolean passed;
    
    // Constructors
    public TestResultRequest() {}
    
    public TestResultRequest(Long enrollmentId, Long courseId, Long studentId, 
                           Integer testScore, Integer totalQuestions, 
                           Double percentage, Boolean passed) {
        this.enrollmentId = enrollmentId;
        this.courseId = courseId;
        this.studentId = studentId;
        this.testScore = testScore;
        this.totalQuestions = totalQuestions;
        this.percentage = percentage;
        this.passed = passed;
    }
    
    // Getters and Setters
    public Long getEnrollmentId() { return enrollmentId; }
    public void setEnrollmentId(Long enrollmentId) { this.enrollmentId = enrollmentId; }
    
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    
    public Integer getTestScore() { return testScore; }
    public void setTestScore(Integer testScore) { this.testScore = testScore; }
    
    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }
    
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
    
    public Boolean getPassed() { return passed; }
    public void setPassed(Boolean passed) { this.passed = passed; }
}