package com.onlinecourses.OnlineCourseSystem.dto;

import java.time.LocalDateTime;

public class EnrollmentResponseDto {
    private Long enrollmentId;
    private Long courseId;
    private String courseTitle;
    private String courseDescription;
    private String category;
    private String instructorName;
    private Double courseRating;
    private Double price;
    private boolean completed;
    private LocalDateTime enrollmentDate;
    private Integer totalRatings;
    private String batch;
    
    // Default constructor
    public EnrollmentResponseDto() {}
    
    // Full constructor
    public EnrollmentResponseDto(Long enrollmentId, Long courseId, String courseTitle, 
                               String courseDescription, String category, String instructorName, 
                               Double courseRating, Double price, boolean completed, 
                               LocalDateTime enrollmentDate, Integer totalRatings, String batch) {
        this.enrollmentId = enrollmentId;
        this.courseId = courseId;
        this.courseTitle = courseTitle;
        this.courseDescription = courseDescription;
        this.category = category;
        this.instructorName = instructorName;
        this.courseRating = courseRating;
        this.price = price;
        this.completed = completed;
        this.enrollmentDate = enrollmentDate;
        this.totalRatings = totalRatings;
        this.batch = batch;
    }
    
    // Minimal constructor for basic info
    public EnrollmentResponseDto(Long enrollmentId, Long courseId, String courseTitle, 
                               String instructorName, Double courseRating, Double price, 
                               boolean completed, LocalDateTime enrollmentDate) {
        this.enrollmentId = enrollmentId;
        this.courseId = courseId;
        this.courseTitle = courseTitle;
        this.instructorName = instructorName;
        this.courseRating = courseRating;
        this.price = price;
        this.completed = completed;
        this.enrollmentDate = enrollmentDate;
    }
    
    // Getters and Setters
    public Long getEnrollmentId() { return enrollmentId; }
    public void setEnrollmentId(Long enrollmentId) { this.enrollmentId = enrollmentId; }
    
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    
    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
    
    public String getCourseDescription() { return courseDescription; }
    public void setCourseDescription(String courseDescription) { this.courseDescription = courseDescription; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getInstructorName() { return instructorName; }
    public void setInstructorName(String instructorName) { this.instructorName = instructorName; }
    
    public Double getCourseRating() { return courseRating; }
    public void setCourseRating(Double courseRating) { this.courseRating = courseRating; }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    
    public LocalDateTime getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDateTime enrollmentDate) { this.enrollmentDate = enrollmentDate; }
    
    public Integer getTotalRatings() { return totalRatings; }
    public void setTotalRatings(Integer totalRatings) { this.totalRatings = totalRatings; }
    
    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
    
    @Override
    public String toString() {
        return "EnrollmentResponseDto{" +
                "enrollmentId=" + enrollmentId +
                ", courseId=" + courseId +
                ", courseTitle='" + courseTitle + '\'' +
                ", courseDescription='" + courseDescription + '\'' +
                ", category='" + category + '\'' +
                ", instructorName='" + instructorName + '\'' +
                ", courseRating=" + courseRating +
                ", price=" + price +
                ", completed=" + completed +
                ", enrollmentDate=" + enrollmentDate +
                ", totalRatings=" + totalRatings +
                ", batch='" + batch + '\'' +
                '}';
    }
}