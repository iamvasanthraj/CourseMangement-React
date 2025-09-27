package com.onlinecourses.OnlineCourseSystem.dto;

public class RatingDto {
    private Integer stars;
    private String comment;
    private Long studentId;
    private Long courseId;
    
    // Constructors
    public RatingDto() {}
    
    public RatingDto(Integer stars, String comment, Long studentId, Long courseId) {
        this.stars = stars;
        this.comment = comment;
        this.studentId = studentId;
        this.courseId = courseId;
    }
    
    // Getters and Setters
    public Integer getStars() { return stars; }
    public void setStars(Integer stars) { this.stars = stars; }
    
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
}