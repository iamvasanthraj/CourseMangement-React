package com.onlinecourses.OnlineCourseSystem.dto;

public class AuthResponse {
    private Long userId;
    private String username;
    private String email;
    private String role;
    private Integer avatarIndex; // ✅ ADD THIS FIELD

    // Constructors
    public AuthResponse() {}
    
    public AuthResponse(Long userId, String username, String email, String role, Integer avatarIndex) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.avatarIndex = avatarIndex;
    }

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    // ✅ ADD: AvatarIndex getter and setter
    public Integer getAvatarIndex() { return avatarIndex; }
    public void setAvatarIndex(Integer avatarIndex) { 
        this.avatarIndex = avatarIndex != null ? avatarIndex : 0;
    }
}