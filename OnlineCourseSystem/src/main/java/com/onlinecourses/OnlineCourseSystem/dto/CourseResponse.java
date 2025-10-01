package com.onlinecourses.OnlineCourseSystem.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CourseResponse {
    private Long id;
    private String title;
    private String category;
    private String duration;
    private String batch;
    private String level;
    private BigDecimal price;
    private String instructorName;
    private Long instructorId;
    private LocalDateTime createdAt;
    
    // ✅ ADD: Rating fields
    private BigDecimal averageRating;
    private Integer totalRatings;
    private Integer enrolledStudents;

    // Constructors
    public CourseResponse() {}

    // Original constructor
    public CourseResponse(Long id, String title, String category, String duration, String batch, 
                         String level, BigDecimal price, String instructorName, Long instructorId, 
                         LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.duration = duration;
        this.batch = batch;
        this.level = level;
        this.price = price;
        this.instructorName = instructorName;
        this.instructorId = instructorId;
        this.createdAt = createdAt;
        // Default values for new fields
        this.averageRating = BigDecimal.ZERO;
        this.totalRatings = 0;
        this.enrolledStudents = 0;
    }

    // ✅ ADD: Enhanced constructor with rating fields
    public CourseResponse(Long id, String title, String category, String duration, String batch, 
                         String level, BigDecimal price, String instructorName, Long instructorId, 
                         LocalDateTime createdAt, BigDecimal averageRating, Integer totalRatings, 
                         Integer enrolledStudents) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.duration = duration;
        this.batch = batch;
        this.level = level;
        this.price = price;
        this.instructorName = instructorName;
        this.instructorId = instructorId;
        this.createdAt = createdAt;
        this.averageRating = averageRating;
        this.totalRatings = totalRatings;
        this.enrolledStudents = enrolledStudents;
    }

    // Getters and Setters for all fields...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getInstructorName() { return instructorName; }
    public void setInstructorName(String instructorName) { this.instructorName = instructorName; }
    public Long getInstructorId() { return instructorId; }
    public void setInstructorId(Long instructorId) { this.instructorId = instructorId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public BigDecimal getAverageRating() { return averageRating; }
    public void setAverageRating(BigDecimal averageRating) { this.averageRating = averageRating; }
    public Integer getTotalRatings() { return totalRatings; }
    public void setTotalRatings(Integer totalRatings) { this.totalRatings = totalRatings; }
    public Integer getEnrolledStudents() { return enrolledStudents; }
    public void setEnrolledStudents(Integer enrolledStudents) { this.enrolledStudents = enrolledStudents; }
}