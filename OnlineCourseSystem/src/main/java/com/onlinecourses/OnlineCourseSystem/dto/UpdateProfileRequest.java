package com.onlinecourses.OnlineCourseSystem.dto;

public class UpdateProfileRequest {
    private String name;
    private String email;
    private Integer avatarIndex;

    // Constructors
    public UpdateProfileRequest() {}
    
    public UpdateProfileRequest(String name, String email, Integer avatarIndex) {
        this.name = name;
        this.email = email;
        this.avatarIndex = avatarIndex;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Integer getAvatarIndex() { return avatarIndex; }
    public void setAvatarIndex(Integer avatarIndex) { this.avatarIndex = avatarIndex; }
}