package com.onlinecourses.OnlineCourseSystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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

    private String category;
    private String duration;
    private String batch;
    private String level;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;

    // ✅ ADD: Rating fields
    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(name = "total_ratings")
    private Integer totalRatings = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "enrollments", "password"})
    private User instructor;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Enrollment> enrollments = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Course() {}
    
    public Course(String title, String category, String duration, String batch, String level, 
                 BigDecimal price, User instructor) {
        this.title = title;
        this.category = category;
        this.duration = duration;
        this.batch = batch;
        this.level = level;
        this.price = price;
        this.instructor = instructor;
    }

    // Getters and Setters
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
    
    // ✅ ADD: Rating getters and setters
    public BigDecimal getAverageRating() { return averageRating; }
    public void setAverageRating(BigDecimal averageRating) { this.averageRating = averageRating; }
    public Integer getTotalRatings() { return totalRatings; }
    public void setTotalRatings(Integer totalRatings) { this.totalRatings = totalRatings; }
    
    public User getInstructor() { return instructor; }
    public void setInstructor(User instructor) { this.instructor = instructor; }
    public List<Enrollment> getEnrollments() { return enrollments; }
    public void setEnrollments(List<Enrollment> enrollments) { this.enrollments = enrollments; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // ✅ ADD: Helper method to calculate enrolled students
    @Transient
    public Integer getEnrolledStudents() {
        return enrollments != null ? enrollments.size() : 0;
    }

    // ✅ ADD: Helper method to get instructor name
   // In Course.java - update the helper method
@Transient
public String getInstructorName() {
    if (instructor != null) {
        // Try common user field names
        try {
            // Try getName() method
            java.lang.reflect.Method getName = instructor.getClass().getMethod("getName");
            String name = (String) getName.invoke(instructor);
            if (name != null && !name.trim().isEmpty()) {
                return name;
            }
        } catch (Exception e) {
            // Ignore and try other methods
        }
        
        try {
            // Try getEmail() method
            java.lang.reflect.Method getEmail = instructor.getClass().getMethod("getEmail");
            String email = (String) getEmail.invoke(instructor);
            if (email != null) {
                return email.split("@")[0]; // Use email prefix
            }
        } catch (Exception e) {
            // Ignore
        }
        
        return "Instructor #" + instructor.getId();
    }
    return "Unknown Instructor";
}
}