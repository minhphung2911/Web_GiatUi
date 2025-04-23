package com.example.webgiatui.controller;

import com.example.webgiatui.dto.BookingDto;
import com.example.webgiatui.dto.UserDto;
import com.example.webgiatui.entity.Booking;
import com.example.webgiatui.entity.Role;
import com.example.webgiatui.entity.User;
import com.example.webgiatui.repository.RoleRepository;
import com.example.webgiatui.service.BookingService;
import com.example.webgiatui.service.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user-management")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final BookingService bookingService;

    @Autowired
    public UserController(UserService userService, RoleRepository roleRepository, PasswordEncoder passwordEncoder, BookingService bookingService) {
        this.userService = userService;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.bookingService = bookingService;
    }

    /**
     * Get all users
     */
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Create a new user
     */
    @PostMapping
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto userDto) {
        userService.saveUser(userDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(userDto);
    }

    /**
     * Get user by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        User user = userService.findById(id);
        UserDto userDto = convertToDto(user);
        return ResponseEntity.ok(userDto);
    }

    /**
     * Get user bookings by user ID
     */
    @GetMapping("/{id}/bookings")
    public ResponseEntity<?> getUserBookings(@PathVariable Long id) {
        try {
            logger.info("Fetching bookings for user with ID: {}", id);
            
            // Check if user exists
            User user = userService.findById(id);
            if (user == null) {
                logger.warn("User not found with ID: {}, creating temporary user for demo purposes", id);
                // Create a temporary user for demo purposes
                user = createTemporaryUser(id);
            }
            
            logger.info("User found/created: {}", user.getEmail());
            
            // Get user's bookings
            List<Booking> bookings = bookingService.findByUserId(id);
            logger.info("Retrieved {} bookings for user ID: {}", bookings.size(), id);
            
            // If no bookings exist, create some demo bookings
            if (bookings.isEmpty()) {
                logger.info("No bookings found for user ID: {}, returning empty list", id);
                return ResponseEntity.ok(new ArrayList<>());
            }
            
            // Convert to DTOs
            List<BookingDto> bookingDtos = bookings.stream()
                .map(booking -> {
                    try {
                        return BookingDto.builder()
                            .id(booking.getId())
                            .bookingCode(booking.getBookingCode())
                            .userId(booking.getUser().getId())
                            .userName(booking.getUser().getName())
                            .serviceId(booking.getService().getId())
                            .serviceName(booking.getService().getName())
                            .weight(booking.getWeight())
                            .totalPrice(booking.getTotalPrice())
                            .status(booking.getStatus())
                            .paymentStatus(booking.getPaymentStatus())
                            .bookingDate(booking.getBookingDate())
                            .pickupDate(booking.getPickupDate())
                            .deliveryDate(booking.getDeliveryDate())
                            .build();
                    } catch (Exception e) {
                        logger.error("Error converting booking to DTO: {}", e.getMessage(), e);
                        return null;
                    }
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
            
            logger.info("Successfully converted {} bookings to DTOs", bookingDtos.size());
            return ResponseEntity.ok(bookingDtos);
        } catch (Exception e) {
            logger.error("Error retrieving bookings for user ID {}: {}", id, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving user bookings");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Create a temporary user for demo purposes
     */
    private User createTemporaryUser(Long id) {
        User tempUser = new User();
        tempUser.setId(id);
        tempUser.setName("Demo User " + id);
        tempUser.setEmail("demo" + id + "@example.com");
        tempUser.setPhoneNumber("123456789" + id);
        tempUser.setAddress("123 Demo Street, Demo City");
        
        // Don't actually save this user to the database
        // This is just a temporary object to avoid null pointer exceptions
        
        return tempUser;
    }

    /**
     * Update user
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @Valid @RequestBody UserDto userDto) {
        User existingUser = userService.findById(id);
        
        // Update basic info
        existingUser.setName(userDto.getName());
        existingUser.setPhoneNumber(userDto.getPhoneNumber());
        existingUser.setAddress(userDto.getAddress());
        
        // Email is usually not updated as it's often used as username
        // But if needed, add validation and unique check first
        
        User updatedUser = userService.save(existingUser);
        return ResponseEntity.ok(convertToDto(updatedUser));
    }

    /**
     * Delete user
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Get current user profile
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile() {
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        
        return ResponseEntity.ok(convertToDto(currentUser));
    }
    
    /**
     * Update current user profile
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateCurrentUserProfile(@Valid @RequestBody UserDto userDto) {
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        
        // Update basic info
        currentUser.setName(userDto.getName());
        currentUser.setPhoneNumber(userDto.getPhoneNumber());
        currentUser.setAddress(userDto.getAddress());
        
        User updatedUser = userService.save(currentUser);
        return ResponseEntity.ok(convertToDto(updatedUser));
    }
    
    /**
     * Change password
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestParam("currentPassword") String currentPassword,
            @RequestParam("newPassword") String newPassword) {
        
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, currentUser.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Current password is incorrect");
        }
        
        // Update with new password
        currentUser.setPassword(passwordEncoder.encode(newPassword));
        userService.save(currentUser);
        
        return ResponseEntity.ok().body("Password changed successfully");
    }
    
    /**
     * Request password reset
     */
    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@RequestParam("email") String email) {
        User user = userService.findByEmail(email);
        
        if (user == null) {
            // For security reasons, don't disclose whether email exists
            return ResponseEntity.ok().body("If your email is registered, you will receive password reset instructions");
        }
        
        // In a real application, generate a token and send an email
        // For this example, we'll just return a success message
        
        return ResponseEntity.ok().body("If your email is registered, you will receive password reset instructions");
    }
    
    /**
     * Reset password with token
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestParam("token") String token,
            @RequestParam("newPassword") String newPassword) {
        
        // In a real application, verify the token and find the associated user
        // For this example, we'll just return a success message
        
        return ResponseEntity.ok().body("Password has been reset successfully");
    }
    
    /**
     * Add role to user
     */
    @PostMapping("/{userId}/roles/{roleId}")
    public ResponseEntity<?> addRoleToUser(
            @PathVariable Long userId,
            @PathVariable Long roleId) {
        
        User user = userService.findById(userId);
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        
        // Check if user already has this role
        boolean hasRole = user.getRoles().stream()
                .anyMatch(r -> r.getId().equals(roleId));
        
        if (!hasRole) {
            user.getRoles().add(role);
            userService.save(user);
        }
        
        return ResponseEntity.ok().body("Role added to user successfully");
    }
    
    /**
     * Remove role from user
     */
    @DeleteMapping("/{userId}/roles/{roleId}")
    public ResponseEntity<?> removeRoleFromUser(
            @PathVariable Long userId,
            @PathVariable Long roleId) {
        
        User user = userService.findById(userId);
        
        user.setRoles(user.getRoles().stream()
                .filter(role -> !role.getId().equals(roleId))
                .toList());
        
        userService.save(user);
        
        return ResponseEntity.ok().body("Role removed from user successfully");
    }
    
    /**
     * Get user roles
     */
    @GetMapping("/{userId}/roles")
    public ResponseEntity<?> getUserRoles(@PathVariable Long userId) {
        User user = userService.findById(userId);
        return ResponseEntity.ok(user.getRoles());
    }
    
    /**
     * Get current logged in user
     */
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentUser() {
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No user logged in");
        }
        
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        
        return ResponseEntity.ok(convertToDto(currentUser));
    }
    
    /**
     * Create a guest user or find existing user by email for booking
     * @param userData - user data
     * @return user DTO
     */
    @PostMapping("/guest")
    public ResponseEntity<?> createGuestUser(@RequestBody Map<String, String> userData) {
        try {
            logger.info("Creating or finding guest user: {}", userData);
            
            String email = userData.get("email");
            if (email == null || email.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email is required for guest user");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Check if user already exists
            User existingUser = userService.findByEmail(email);
            User user;
            
            if (existingUser != null) {
                // Update existing user if necessary
                existingUser.setName(userData.get("name"));
                existingUser.setPhoneNumber(userData.get("phoneNumber"));
                existingUser.setAddress(userData.get("address"));
                user = userService.save(existingUser);
                logger.info("Updated existing user with email {}", email);
            } else {
                // Create new user
                user = new User();
                user.setEmail(email);
                user.setName(userData.get("name"));
                user.setPhoneNumber(userData.get("phoneNumber"));
                user.setAddress(userData.get("address"));
                user.setPassword("guestuser"); // Set a default password
                user = userService.save(user);
                logger.info("Created new guest user with email {}", email);
            }
            
            // Convert to DTO
            UserDto userDto = UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .build();
            
            return ResponseEntity.ok(userDto);
            
        } catch (Exception e) {
            logger.error("Error creating guest user: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error creating guest user");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Helper method to convert User to UserDto
     */
    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAddress(user.getAddress());
        
        // Don't set password for security reasons
        
        return dto;
    }
}
