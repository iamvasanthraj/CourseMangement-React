package com.onlinecourses.OnlineCourseSystem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
public class Certificate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String certificateId;

    @ManyToOne
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String courseTitle;

    @Column(nullable = false)
    private String courseCategory;

    private String instructorName;

    @Column(nullable = false)
    private LocalDateTime issueDate;

    private LocalDateTime completionDate;

    private Integer score;

    @Column(length = 1000)
    private String certificateUrl;

    @PrePersist
    protected void onCreate() {
        issueDate = LocalDateTime.now();
        // Generate unique certificate ID
        if (certificateId == null) {
            certificateId = "CERT-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
        }
    }

    // Constructors
    public Certificate() {}

    public Certificate(Enrollment enrollment, String studentName, String courseTitle, 
                      String courseCategory, String instructorName, Integer score) {
        this.enrollment = enrollment;
        this.studentName = studentName;
        this.courseTitle = courseTitle;
        this.courseCategory = courseCategory;
        this.instructorName = instructorName;
        this.score = score;
        this.completionDate = enrollment.getCompletionDate();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }
    public Enrollment getEnrollment() { return enrollment; }
    public void setEnrollment(Enrollment enrollment) { this.enrollment = enrollment; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
    public String getCourseCategory() { return courseCategory; }
    public void setCourseCategory(String courseCategory) { this.courseCategory = courseCategory; }
    public String getInstructorName() { return instructorName; }
    public void setInstructorName(String instructorName) { this.instructorName = instructorName; }
    public LocalDateTime getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDateTime issueDate) { this.issueDate = issueDate; }
    public LocalDateTime getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDateTime completionDate) { this.completionDate = completionDate; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public String getCertificateUrl() { return certificateUrl; }
    public void setCertificateUrl(String certificateUrl) { this.certificateUrl = certificateUrl; }
}