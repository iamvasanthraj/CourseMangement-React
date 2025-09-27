package com.onlinecourses.OnlineCourseSystem.dto;

public class CourseDto {
    private String title;
    private String description;
    private String category;
    private Double price;
    private String instructorName;
    private Long instructorId;
    private String batch;
    
    // Constructors
    public CourseDto() {}
    
    public CourseDto(String title, String description, String category, Double price, 
                    String instructorName, Long instructorId, String batch) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.price = price;
        this.instructorName = instructorName;
        this.instructorId = instructorId;
        this.batch = batch;
    }
    
    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    
    public String getInstructorName() { return instructorName; }
    public void setInstructorName(String instructorName) { this.instructorName = instructorName; }
    
    public Long getInstructorId() { return instructorId; }
    public void setInstructorId(Long instructorId) { this.instructorId = instructorId; }
    
    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
}