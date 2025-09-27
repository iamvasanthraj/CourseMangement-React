package com.onlinecourses.OnlineCourseSystem.dto;

import java.time.LocalDateTime;

public class CourseEnrollmentDto {
    private Long enrollmentId;
    private Long studentId;
    private Long courseId;
    private String studentName;
    private LocalDateTime enrollmentDate;
    private boolean completed;
    private LocalDateTime completionDate;
    private String courseTitle;
    private String instructorName;
    
    // Constructors, Getters, and Setters
    public CourseEnrollmentDto() {}
    
    public CourseEnrollmentDto(Long enrollmentId, Long studentId, Long courseId, 
                              LocalDateTime enrollmentDate, boolean completed, 
                              LocalDateTime completionDate, String courseTitle, 
                              String instructorName) {
        this.enrollmentId = enrollmentId;
        this.studentId = studentId;
        this.courseId = courseId;
        this.studentName = "Student " + studentId;
        this.enrollmentDate = enrollmentDate;
        this.completed = completed;
        this.completionDate = completionDate;
        this.courseTitle = courseTitle;
        this.instructorName = instructorName;
    }
    
    // Getters and Setters
    public Long getEnrollmentId() { return enrollmentId; }
    public void setEnrollmentId(Long enrollmentId) { this.enrollmentId = enrollmentId; }
    
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    
    public LocalDateTime getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDateTime enrollmentDate) { this.enrollmentDate = enrollmentDate; }
    
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    
    public LocalDateTime getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDateTime completionDate) { this.completionDate = completionDate; }
    
    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
    
    public String getInstructorName() { return instructorName; }
    public void setInstructorName(String instructorName) { this.instructorName = instructorName; }
}