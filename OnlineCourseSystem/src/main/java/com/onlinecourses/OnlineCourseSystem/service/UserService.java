package com.onlinecourses.OnlineCourseSystem.service;

import com.onlinecourses.OnlineCourseSystem.entity.User;
import com.onlinecourses.OnlineCourseSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // ✅ REMOVED: PasswordEncoder dependency
    
    public User createUser(User user) {
        // Store password as plain text (for prototype only)
        return userRepository.save(user);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public Boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    // Additional method to get users by role
    public List<User> getUsersByRole(String role) {
        return userRepository.findAll().stream()
            .filter(user -> user.getRole().name().equalsIgnoreCase(role))
            .toList();
    }
    
    // ✅ ADD: Update user method
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    // ✅ ADD: Change password method (plain text for prototype)
    public boolean changePassword(Long userId, String currentPassword, String newPassword) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            // Compare plain text passwords (for prototype only)
            if (currentPassword.equals(user.getPassword())) {
                // Store new password as plain text (for prototype only)
                user.setPassword(newPassword);
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }
    
    // ✅ ADD: Simple update method
    public User saveUser(User user) {
        return userRepository.save(user);
    }
}