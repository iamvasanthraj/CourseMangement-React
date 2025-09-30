package com.onlinecourses.OnlineCourseSystem.dto;

public class AuthResponse {
    private Long userId;
    private String username;
    private String email;
    private String role;

    // Constructors
    public AuthResponse() {}
    
    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}