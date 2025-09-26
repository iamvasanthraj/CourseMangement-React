package com.onlinecourses.OnlineCourseSystem.dto;

public class CourseDto {
    private String title;
    private String description;
    private Long instructorId;

    // Constructors
    public CourseDto() {}

    public CourseDto(String title, String description, Long instructorId) {
        this.title = title;
        this.description = description;
        this.instructorId = instructorId;
    }

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Long getInstructorId() { return instructorId; }
    public void setInstructorId(Long instructorId) { this.instructorId = instructorId; }
}