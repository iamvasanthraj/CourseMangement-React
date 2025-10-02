package com.onlinecourses.OnlineCourseSystem.dto;

public class ChangePasswordRequest {
    private String currentPassword;
    private String newPassword;

    // Constructors
    public ChangePasswordRequest() {}
    
    public ChangePasswordRequest(String currentPassword, String newPassword) {
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
    }

    // Getters and Setters
    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}