package com.example.webgiatui.controller;

import com.example.webgiatui.dto.BookingDto;
import com.example.webgiatui.dto.UserDto;
import com.example.webgiatui.entity.Booking;
import com.example.webgiatui.entity.User;
import com.example.webgiatui.service.BookingService;
import com.example.webgiatui.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserApiController {

    private static final Logger logger = LoggerFactory.getLogger(UserApiController.class);
    
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final BookingService bookingService;

    @Autowired
    public UserApiController(UserService userService, PasswordEncoder passwordEncoder, BookingService bookingService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Convert to DTO
        UserDto userDto = convertToDto(user);
        return ResponseEntity.ok(userDto);
    }
    
    /**
     * Get user's bookings by user ID
     */
    @GetMapping("/{id}/bookings")
    public ResponseEntity<?> getUserBookings(@PathVariable Long id) {
        try {
            logger.info("Fetching bookings for user with ID: {}", id);
            
            // Check if user exists
            User user = userService.findById(id);
            if (user == null) {
                logger.warn("User not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }
            
            logger.info("Found user: {}", user.getEmail());
            
            // Get user's bookings
            List<Booking> bookings = bookingService.findByUserId(id);
            logger.info("Retrieved {} bookings for user ID: {}", bookings.size(), id);
            
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
                            .address(booking.getAddress())
                            .notes(booking.getNotes())
                            .completionDate(booking.getCompletionDate())
                            .createdAt(booking.getCreatedAt())
                            .updatedAt(booking.getUpdatedAt())
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

    @PostMapping
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto userDto) {
        // Check if user with this email already exists
        User existingUser = userService.findByEmail(userDto.getEmail());
        if (existingUser != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // Save the user
        userService.saveUser(userDto);
        
        // Return the created user
        User createdUser = userService.findByEmail(userDto.getEmail());
        if (createdUser == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        
        // Convert back to DTO
        UserDto createdUserDto = convertToDto(createdUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUserDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @Valid @RequestBody UserDto userDto) {
        User existingUser = userService.findById(id);
        if (existingUser == null) {
            return ResponseEntity.notFound().build();
        }

        // Check if another user with the same email exists
        User userWithSameEmail = userService.findByEmail(userDto.getEmail());
        if (userWithSameEmail != null && !userWithSameEmail.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // Set ID to ensure we're updating the right user
        userDto.setId(id);
        
        // If password is empty, use the existing one
        if (userDto.getPassword() == null || userDto.getPassword().isEmpty()) {
            // The service implementation will handle keeping the existing password
        } else {
            // Password will be encoded by the service
        }
        
        // Update the user
        userService.saveUser(userDto);
        
        // Return the updated user
        User updatedUser = userService.findById(id);
        UserDto updatedUserDto = convertToDto(updatedUser);
        
        return ResponseEntity.ok(updatedUserDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Convert User entity to UserDto
     */
    private UserDto convertToDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        userDto.setEmail(user.getEmail());
        userDto.setPhoneNumber(user.getPhoneNumber());
        userDto.setAddress(user.getAddress());
        return userDto;
    }
} 