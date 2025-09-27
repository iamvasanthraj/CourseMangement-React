package com.onlinecourses.OnlineCourseSystem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ratings")
public class Rating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Integer stars; // 1 to 5
    
    private String comment;
    
    private LocalDateTime ratingDate;
    
    @Column(name = "student_id", nullable = false)
    private Long studentId;
    
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    // Constructors
    public Rating() {
        this.ratingDate = LocalDateTime.now();
    }
    
    public Rating(Integer stars, String comment, Long studentId, Course course) {
        this.stars = stars;
        this.comment = comment;
        this.studentId = studentId;
        this.course = course;
        this.ratingDate = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Integer getStars() { return stars; }
    public void setStars(Integer stars) { this.stars = stars; }
    
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    
    public LocalDateTime getRatingDate() { return ratingDate; }
    public void setRatingDate(LocalDateTime ratingDate) { this.ratingDate = ratingDate; }
    
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
}