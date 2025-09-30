package com.onlinecourses.OnlineCourseSystem.dto;

import java.time.LocalDateTime;

public class EnrollmentResponse {
    private Long enrollmentId;  // Changed from 'id' to 'enrollmentId'
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseTitle;
    private String courseCategory;
    private LocalDateTime enrollmentDate;
    private LocalDateTime completionDate;
    private boolean completed;
    private Integer rating;
    private String feedback;

    // Constructors
    public EnrollmentResponse() {}

    public EnrollmentResponse(Long enrollmentId, Long studentId, String studentName, Long courseId, 
                            String courseTitle, String courseCategory, LocalDateTime enrollmentDate,
                            LocalDateTime completionDate, boolean completed, Integer rating, String feedback) {
        this.enrollmentId = enrollmentId;  // Updated parameter name
        this.studentId = studentId;
        this.studentName = studentName;
        this.courseId = courseId;
        this.courseTitle = courseTitle;
        this.courseCategory = courseCategory;
        this.enrollmentDate = enrollmentDate;
        this.completionDate = completionDate;
        this.completed = completed;
        this.rating = rating;
        this.feedback = feedback;
    }

    // Getters and Setters - UPDATED
    public Long getEnrollmentId() { return enrollmentId; }
    public void setEnrollmentId(Long enrollmentId) { this.enrollmentId = enrollmentId; }
    
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
    public String getCourseCategory() { return courseCategory; }
    public void setCourseCategory(String courseCategory) { this.courseCategory = courseCategory; }
    public LocalDateTime getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDateTime enrollmentDate) { this.enrollmentDate = enrollmentDate; }
    public LocalDateTime getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDateTime completionDate) { this.completionDate = completionDate; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    @Override
    public String toString() {
        return "EnrollmentResponse{" +
                "enrollmentId=" + enrollmentId +
                ", studentId=" + studentId +
                ", studentName='" + studentName + '\'' +
                ", courseId=" + courseId +
                ", courseTitle='" + courseTitle + '\'' +
                ", completed=" + completed +
                '}';
    }
}