package com.onlinecourses.OnlineCourseSystem.dto;

public class CertificateRequest {
    private Long enrollmentId;
    private String studentName;
    private String courseTitle;
    private String courseCategory;
    private String instructorName;
    private Integer score;

    // Constructors
    public CertificateRequest() {}

    // Getters and Setters
    public Long getEnrollmentId() { return enrollmentId; }
    public void setEnrollmentId(Long enrollmentId) { this.enrollmentId = enrollmentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
    public String getCourseCategory() { return courseCategory; }
    public void setCourseCategory(String courseCategory) { this.courseCategory = courseCategory; }
    public String getInstructorName() { return instructorName; }
    public void setInstructorName(String instructorName) { this.instructorName = instructorName; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
}