package com.onlinecourses.OnlineCourseSystem.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    private String description;
    
    @Column(nullable = false)
    private String category; // BACKEND, FRONTEND, CYBERSECURITY, DATABASE, etc.
    
    @Column(nullable = false)
    private Double price;
    
    private Double rating = 0.0;
    
    private Integer totalRatings = 0;
    
    private String batch = "New Batch"; // New Batch, Ongoing, Completed
    
    @Column(name = "instructor_name")
    private String instructorName;
    
    @Column(name = "instructor_id", nullable = false)
    private Long instructorId;
    
    // Constructors
    public Course() {}
    
    public Course(String title, String description, String category, Double price, 
                 String instructorName, Long instructorId) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.price = price;
        this.instructorName = instructorName;
        this.instructorId = instructorId;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    
    public Integer getTotalRatings() { return totalRatings; }
    public void setTotalRatings(Integer totalRatings) { this.totalRatings = totalRatings; }
    
    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
    
    public String getInstructorName() { return instructorName; }
    public void setInstructorName(String instructorName) { this.instructorName = instructorName; }
    
    public Long getInstructorId() { return instructorId; }
    public void setInstructorId(Long instructorId) { this.instructorId = instructorId; }
}