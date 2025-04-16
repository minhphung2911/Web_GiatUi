package com.example.webgiatui.controller;

import com.example.webgiatui.dto.UserDto;
import com.example.webgiatui.entity.User;
import com.example.webgiatui.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public ProfileController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Get the profile information for the currently authenticated user
     */
    @GetMapping
    public ResponseEntity<UserDto> getUserProfile() {
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Convert user to DTO (without password)
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setFirstName(user.getFirstName());
        userDto.setLastName(user.getLastName());
        userDto.setEmail(user.getEmail());
        userDto.setPhoneNumber(user.getPhoneNumber());
        userDto.setAddress(user.getAddress());

        return ResponseEntity.ok(userDto);
    }

    /**
     * Update the profile information for the currently authenticated user
     */
    @PutMapping
    public ResponseEntity<?> updateUserProfile(@Valid @RequestBody UserDto userDto) {
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);

        if (currentUser == null) {
            return ResponseEntity.notFound().build();
        }

        // Check if email is being changed and if it already exists
        if (!email.equals(userDto.getEmail())) {
            User existingUser = userService.findByEmail(userDto.getEmail());
            if (existingUser != null) {
                Map<String, String> errors = new HashMap<>();
                errors.put("email", "Email already exists");
                return ResponseEntity.badRequest().body(errors);
            }
        }

        // Update user fields
        User updatedUser = new User();
        updatedUser.setId(currentUser.getId());
        updatedUser.setName(userDto.getFirstName() + " " + userDto.getLastName());
        updatedUser.setEmail(userDto.getEmail());
        updatedUser.setPassword(currentUser.getPassword()); // Keep existing password
        updatedUser.setPhoneNumber(userDto.getPhoneNumber());
        updatedUser.setAddress(userDto.getAddress());
        updatedUser.setRoles(currentUser.getRoles()); // Keep existing roles
        updatedUser.setOrders(currentUser.getOrders()); // Keep existing orders

        // Save updated user
        User result = userService.update(currentUser.getId(), updatedUser);

        // Convert result to DTO
        UserDto resultDto = new UserDto();
        resultDto.setId(result.getId());
        resultDto.setFirstName(result.getFirstName());
        resultDto.setLastName(result.getLastName());
        resultDto.setEmail(result.getEmail());
        resultDto.setPhoneNumber(result.getPhoneNumber());
        resultDto.setAddress(result.getAddress());

        return ResponseEntity.ok(resultDto);
    }

    /**
     * Change password for the currently authenticated user
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordData) {
        // Get required data
        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");
        String confirmPassword = passwordData.get("confirmPassword");

        // Basic validation
        if (currentPassword == null || newPassword == null || confirmPassword == null) {
            return ResponseEntity.badRequest().body("Missing required password fields");
        }

        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body("New passwords do not match");
        }

        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);

        if (currentUser == null) {
            return ResponseEntity.notFound().build();
        }

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, currentUser.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Current password is incorrect");
        }

        // Update password
        User updatedUser = new User();
        updatedUser.setId(currentUser.getId());
        updatedUser.setName(currentUser.getName());
        updatedUser.setEmail(currentUser.getEmail());
        updatedUser.setPassword(passwordEncoder.encode(newPassword));
        updatedUser.setPhoneNumber(currentUser.getPhoneNumber());
        updatedUser.setAddress(currentUser.getAddress());
        updatedUser.setRoles(currentUser.getRoles());
        updatedUser.setOrders(currentUser.getOrders());

        userService.update(currentUser.getId(), updatedUser);

        return ResponseEntity.ok("Password updated successfully");
    }

    /**
     * Update user preferences
     */
    @PostMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@RequestBody Map<String, Object> preferences) {
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);

        if (currentUser == null) {
            return ResponseEntity.notFound().build();
        }

        // In a real application, you would store these preferences in the database
        // For this example, we'll just return a success response
        return ResponseEntity.ok("Preferences updated successfully");
    }
} 