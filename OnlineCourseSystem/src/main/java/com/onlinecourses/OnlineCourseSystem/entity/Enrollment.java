package com.onlinecourses.OnlineCourseSystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "course_id"})
})
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "enrollments", "password"})
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "enrollments"})
    private Course course;

    @Column(name = "enrollment_date")
    private LocalDateTime enrollmentDate;

    @Column(name = "completion_date")
    private LocalDateTime completionDate;

    private boolean completed = false;
    private Integer rating;
    
    @Column(length = 1000)
    private String feedback;

    // ✅ ADD: Test score fields
    @Column(name = "test_score")
    private Integer testScore = 0;

    @Column(name = "total_questions")
    private Integer totalQuestions = 10;

    @Column(name = "percentage")
    private Double percentage = 0.0;

    @Column(name = "passed")
    private Boolean passed = false;

    @PrePersist
    protected void onCreate() {
        enrollmentDate = LocalDateTime.now();
    }

    // Constructors
    public Enrollment() {}
    
    public Enrollment(User student, Course course) {
        this.student = student;
        this.course = course;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
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

    // ✅ ADD: Getters and setters for test score fields
    public Integer getTestScore() { 
        return testScore != null ? testScore : 0; 
    }
    public void setTestScore(Integer testScore) { 
        this.testScore = testScore; 
    }

    public Integer getTotalQuestions() { 
        return totalQuestions != null ? totalQuestions : 10; 
    }
    public void setTotalQuestions(Integer totalQuestions) { 
        this.totalQuestions = totalQuestions; 
    }

    public Double getPercentage() { 
        return percentage != null ? percentage : 0.0; 
    }
    public void setPercentage(Double percentage) { 
        this.percentage = percentage; 
    }

    public Boolean getPassed() { 
        return passed != null ? passed : false; 
    }
    public void setPassed(Boolean passed) { 
        this.passed = passed; 
    }

    // ✅ ADD: Helper method to calculate percentage
    public void calculatePercentage() {
        if (testScore != null && totalQuestions != null && totalQuestions > 0) {
            this.percentage = (testScore.doubleValue() / totalQuestions.doubleValue()) * 100.0;
            this.passed = this.percentage >= 60.0; // 60% passing threshold
        }
    }

    // ✅ FIXED: Remove auto-completion from test results update
    public void updateTestResults(Integer testScore, Integer totalQuestions) {
        this.testScore = testScore;
        this.totalQuestions = totalQuestions;
        calculatePercentage();
        
        // ❌ REMOVED: Auto-complete course if test is passed
        // Let the service layer handle completion logic instead
        System.out.println("📊 Test results updated - Score: " + testScore + "/" + totalQuestions + 
                          " (" + percentage + "%) - Passed: " + passed);
    }

    // ✅ ADD: Method to mark course as completed (only call this when appropriate)
    public void markAsCompleted() {
        this.completed = true;
        this.completionDate = LocalDateTime.now();
        System.out.println("🏆 Course marked as completed");
    }

    @Override
    public String toString() {
        return "Enrollment{" +
                "id=" + id +
                ", student=" + (student != null ? student.getId() : "null") +
                ", course=" + (course != null ? course.getId() : "null") +
                ", enrollmentDate=" + enrollmentDate +
                ", completionDate=" + completionDate +
                ", completed=" + completed +
                ", rating=" + rating +
                ", testScore=" + testScore +
                ", totalQuestions=" + totalQuestions +
                ", percentage=" + percentage +
                ", passed=" + passed +
                '}';
    }
}