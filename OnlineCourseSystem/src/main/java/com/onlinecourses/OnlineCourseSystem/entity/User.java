package com.onlinecourses.OnlineCourseSystem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // ✅ ADD: Avatar field - store the index (0-19) for default avatars
    @Column(name = "avatar_index")
    private Integer avatarIndex = 0; // Default to first avatar

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (avatarIndex == null) {
            avatarIndex = 0; // Ensure default value
        }
    }

    // Constructors, Getters and Setters
    public User() {}
    public User(String name, String email, String password, UserRole role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.avatarIndex = 0; // Default avatar
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    
    // ✅ ADD: Avatar getter and setter
    public Integer getAvatarIndex() { return avatarIndex; }
    public void setAvatarIndex(Integer avatarIndex) { 
        this.avatarIndex = avatarIndex != null ? avatarIndex : 0;
    }
}