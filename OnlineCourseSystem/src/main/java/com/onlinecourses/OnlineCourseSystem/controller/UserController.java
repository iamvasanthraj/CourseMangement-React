package com.onlinecourses.OnlineCourseSystem.controller;

import com.onlinecourses.OnlineCourseSystem.dto.ChangePasswordRequest;
import com.onlinecourses.OnlineCourseSystem.dto.UpdateProfileRequest;
import com.onlinecourses.OnlineCourseSystem.entity.User;
import com.onlinecourses.OnlineCourseSystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        try {
            Optional<User> user = userService.findById(id);
            return user.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get user by email
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        try {
            Optional<User> user = userService.findByEmail(email);
            return user.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ✅ UPDATE: Enhanced update user endpoint with DTO
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateProfileRequest updateRequest) {
        try {
            Optional<User> userOptional = userService.findById(id);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                
                // Update fields if provided
                if (updateRequest.getName() != null && !updateRequest.getName().trim().isEmpty()) {
                    user.setName(updateRequest.getName());
                }
                if (updateRequest.getEmail() != null && !updateRequest.getEmail().trim().isEmpty()) {
                    // Check if email is already taken by another user
                    Optional<User> existingUser = userService.findByEmail(updateRequest.getEmail());
                    if (existingUser.isPresent() && !existingUser.get().getId().equals(id)) {
                        return ResponseEntity.badRequest().body("{\"message\": \"Email is already taken\"}");
                    }
                    user.setEmail(updateRequest.getEmail());
                }
                if (updateRequest.getAvatarIndex() != null) {
                    user.setAvatarIndex(updateRequest.getAvatarIndex());
                }
                
                User updatedUser = userService.updateUser(user);
                return ResponseEntity.ok(updatedUser);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"Failed to update user: " + e.getMessage() + "\"}");
        }
    }

    // ✅ ADD: Change password endpoint (updated with userId from path)
    @PostMapping("/{userId}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long userId, @RequestBody ChangePasswordRequest passwordRequest) {
        try {
            boolean success = userService.changePassword(
                userId,
                passwordRequest.getCurrentPassword(), 
                passwordRequest.getNewPassword()
            );
            
            if (success) {
                return ResponseEntity.ok().body("{\"message\": \"Password changed successfully\", \"success\": true}");
            } else {
                return ResponseEntity.badRequest().body("{\"message\": \"Current password is incorrect\", \"success\": false}");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"Failed to change password: " + e.getMessage() + "\", \"success\": false}");
        }
    }

    // ✅ ADD: Update avatar only endpoint
    @PatchMapping("/{id}/avatar")
    public ResponseEntity<?> updateAvatar(@PathVariable Long id, @RequestBody UpdateProfileRequest updateRequest) {
        try {
            Optional<User> userOptional = userService.findById(id);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                
                if (updateRequest.getAvatarIndex() != null) {
                    user.setAvatarIndex(updateRequest.getAvatarIndex());
                    User updatedUser = userService.updateUser(user);
                    return ResponseEntity.ok(updatedUser);
                } else {
                    return ResponseEntity.badRequest().body("{\"message\": \"Avatar index is required\"}");
                }
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"Failed to update avatar: " + e.getMessage() + "\"}");
        }
    }

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            Optional<User> user = userService.findById(id);
            if (user.isPresent()) {
                userService.deleteUser(id);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"Failed to delete user: " + e.getMessage() + "\"}");
        }
    }

    // Get users by role
    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        try {
            List<User> users = userService.getUsersByRole(role);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Check if email exists
    @GetMapping("/check-email/{email}")
    public ResponseEntity<Boolean> checkEmailExists(@PathVariable String email) {
        try {
            Boolean exists = userService.existsByEmail(email);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}