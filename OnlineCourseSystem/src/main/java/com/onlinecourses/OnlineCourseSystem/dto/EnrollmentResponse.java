package com.onlinecourses.OnlineCourseSystem.dto;

import java.time.LocalDateTime;

public class EnrollmentResponse {
    private Long enrollmentId;
    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseTitle;
    private String courseCategory;
    private LocalDateTime enrollmentDate;
    private Boolean completed;
    private LocalDateTime completionDate;
    
    // ✅ ADD: Test score fields
    private Integer testScore;
    private Integer totalQuestions;
    private Double percentage;
    private Boolean passed;
    
    // Rating fields
    private Integer rating;
    private String feedback;
    
    // Course details
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

    // Getters and Setters for all fields
    public Long getEnrollmentId() { return enrollmentId; }
    public void setEnrollmentId(Long enrollmentId) { this.enrollmentId = enrollmentId; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }
    public LocalDateTime getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDateTime completionDate) { this.completionDate = completionDate; }

    // ✅ ADD: Test score field getters and setters
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

    // Rating fields
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    // Course details
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
                "id=" + id +
                ", studentId=" + studentId +
                ", courseTitle='" + courseTitle + '\'' +
                ", completed=" + completed +
                ", testScore=" + testScore +
                ", passed=" + passed +
                '}';
    }
}