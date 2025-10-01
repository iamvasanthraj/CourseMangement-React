package com.onlinecourses.OnlineCourseSystem.dto;

import java.time.LocalDateTime;

public class EnrollmentResponse {
    private Long enrollmentId;
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

    // ✅ ADD: Course rating data
    private Double courseAverageRating;
    private Integer courseTotalRatings;
    private Integer enrolledStudents;
    private String instructorName;
    private String duration;
    private String level;
    private String batch;
    private Double price;

    // Constructors
    public EnrollmentResponse() {}

    public EnrollmentResponse(Long enrollmentId, Long studentId, String studentName, Long courseId, 
                            String courseTitle, String courseCategory, LocalDateTime enrollmentDate,
                            LocalDateTime completionDate, boolean completed, Integer rating, String feedback) {
        this.enrollmentId = enrollmentId;
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

    // ✅ ADD: Enhanced constructor with course data
    public EnrollmentResponse(Long enrollmentId, Long studentId, String studentName, Long courseId, 
                            String courseTitle, String courseCategory, LocalDateTime enrollmentDate,
                            LocalDateTime completionDate, boolean completed, Integer rating, String feedback,
                            Double courseAverageRating, Integer courseTotalRatings, Integer enrolledStudents,
                            String instructorName, String duration, String level, String batch, Double price) {
        this.enrollmentId = enrollmentId;
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
        this.courseAverageRating = courseAverageRating;
        this.courseTotalRatings = courseTotalRatings;
        this.enrolledStudents = enrolledStudents;
        this.instructorName = instructorName;
        this.duration = duration;
        this.level = level;
        this.batch = batch;
        this.price = price;
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

    // ✅ ADD: Course rating getters and setters
    public Double getCourseAverageRating() { return courseAverageRating; }
    public void setCourseAverageRating(Double courseAverageRating) { this.courseAverageRating = courseAverageRating; }
    public Integer getCourseTotalRatings() { return courseTotalRatings; }
    public void setCourseTotalRatings(Integer courseTotalRatings) { this.courseTotalRatings = courseTotalRatings; }
    public Integer getEnrolledStudents() { return enrolledStudents; }
    public void setEnrolledStudents(Integer enrolledStudents) { this.enrolledStudents = enrolledStudents; }
    public String getInstructorName() { return instructorName; }
    public void setInstructorName(String instructorName) { this.instructorName = instructorName; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    @Override
    public String toString() {
        return "EnrollmentResponse{" +
                "enrollmentId=" + enrollmentId +
                ", studentId=" + studentId +
                ", studentName='" + studentName + '\'' +
                ", courseId=" + courseId +
                ", courseTitle='" + courseTitle + '\'' +
                ", completed=" + completed +
                ", courseAverageRating=" + courseAverageRating +
                ", courseTotalRatings=" + courseTotalRatings +
                '}';
    }
}