package com.onlinecourses.OnlineCourseSystem.controller;

import com.onlinecourses.OnlineCourseSystem.dto.LoginRequest;
import com.onlinecourses.OnlineCourseSystem.dto.AuthResponse;
import com.onlinecourses.OnlineCourseSystem.dto.SignupRequest;
import com.onlinecourses.OnlineCourseSystem.entity.User;
import com.onlinecourses.OnlineCourseSystem.entity.UserRole; // Import UserRole
import com.onlinecourses.OnlineCourseSystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserService userService;

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
    try {
        System.out.println("🔍 === LOGIN ATTEMPT STARTED ===");
        System.out.println("📨 Request received - LoginRequest object: " + loginRequest);
        System.out.println("👤 Username value: '" + loginRequest.getUsername() + "'");
        System.out.println("🔐 Password present: " + (loginRequest.getPassword() != null));
        
        // Check for null values
        if (loginRequest.getUsername() == null || loginRequest.getUsername().trim().isEmpty()) {
            System.out.println("❌ Username is null or empty");
            Map<String, String> error = new HashMap<>();
            error.put("error", "Username is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        if (loginRequest.getPassword() == null || loginRequest.getPassword().trim().isEmpty()) {
            System.out.println("❌ Password is null or empty");
            Map<String, String> error = new HashMap<>();
            error.put("error", "Password is required");
            return ResponseEntity.badRequest().body(error);
        }

        System.out.println("🔎 Searching for user: " + loginRequest.getUsername());
        Optional<User> user = userService.findByEmail(loginRequest.getUsername());
        
        if (user.isPresent()) {
            System.out.println("✅ User found in database: " + user.get().getEmail());
            // Simple password check (no encoding for demo)
            if (user.get().getPassword().equals(loginRequest.getPassword())) {
                System.out.println("🎉 Password matches - login successful");
                
                AuthResponse response = new AuthResponse();
                response.setUserId(user.get().getId());
                response.setUsername(user.get().getName());
                response.setEmail(user.get().getEmail());
                response.setRole(user.get().getRole().name());
                return ResponseEntity.ok(response);
            } else {
                System.out.println("❌ Password does not match");
                System.out.println("Expected: " + user.get().getPassword());
                System.out.println("Received: " + loginRequest.getPassword());
            }
        } else {
            System.out.println("❌ User not found with email: " + loginRequest.getUsername());
        }
        
        Map<String, String> error = new HashMap<>();
        error.put("error", "Invalid username or password");
        return ResponseEntity.badRequest().body(error);
        
    } catch (Exception e) {
        System.out.println("💥 LOGIN EXCEPTION: " + e.getMessage());
        e.printStackTrace();
        Map<String, String> error = new HashMap<>();
        error.put("error", "Login failed: " + e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        try {
            if (userService.existsByEmail(signupRequest.getEmail())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email already registered");
                return ResponseEntity.badRequest().body(error);
            }

            User user = new User();
            user.setName(signupRequest.getUsername());
            user.setEmail(signupRequest.getEmail());
            user.setPassword(signupRequest.getPassword());
            user.setRole(UserRole.valueOf(signupRequest.getRole())); // Now accessible

            User savedUser = userService.createUser(user);

            AuthResponse response = new AuthResponse();
            response.setUserId(savedUser.getId());
            response.setUsername(savedUser.getName());
            response.setEmail(savedUser.getEmail());
            response.setRole(savedUser.getRole().name()); // Now accessible

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Signup failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}