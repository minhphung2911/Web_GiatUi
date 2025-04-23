package com.example.webgiatui.controller;

import com.example.webgiatui.dto.BookingDto;
import com.example.webgiatui.dto.AdminDashboardDto;
import com.example.webgiatui.entity.Booking;
import com.example.webgiatui.entity.Booking.BookingStatus;
import com.example.webgiatui.entity.Booking.PaymentStatus;
import com.example.webgiatui.entity.Feedback;
import com.example.webgiatui.entity.Service;
import com.example.webgiatui.entity.User;
import com.example.webgiatui.service.AdminService;
import com.example.webgiatui.service.BookingService;
import com.example.webgiatui.service.FeedbackService;
import com.example.webgiatui.service.ServiceService;
import com.example.webgiatui.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final ServiceService serviceService;
    private final FeedbackService feedbackService;
    private final AdminService adminService;
    private final BookingService bookingService;

    @Autowired
    public AdminController(UserService userService, ServiceService serviceService, 
                          FeedbackService feedbackService, AdminService adminService, 
                          BookingService bookingService) {
        this.userService = userService;
        this.serviceService = serviceService;
        this.feedbackService = feedbackService;
        this.adminService = adminService;
        this.bookingService = bookingService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        
        try {
            Map<String, Object> adminData = adminService.login(email, password);
            if (adminData != null) {
                return ResponseEntity.ok(adminData);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error during login: " + e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> adminLogout() {
        try {
            adminService.logout();
            return ResponseEntity.ok().body("Logged out successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error during logout: " + e.getMessage());
        }
    }

    /**
     * Get dashboard statistics
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardDto> getDashboardStats() {
        try {
            AdminDashboardDto stats = adminService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get all users - This is a placeholder until UserService is properly implemented
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            // This should be replaced with userService.findAll() once implemented
            return ResponseEntity.ok(new ArrayList<User>());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get all services
     */
    @GetMapping("/services")
    public ResponseEntity<List<Service>> getAllServices() {
        try {
            List<Service> services = serviceService.findAll();
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Create a new service
     */
    @PostMapping("/services")
    public ResponseEntity<?> createService(@RequestBody Service service) {
        try {
            Service savedService = serviceService.save(service);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedService);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating service: " + e.getMessage());
        }
    }

    /**
     * Update an existing service
     */
    @PutMapping("/services/{id}")
    public ResponseEntity<?> updateService(@PathVariable Long id, @RequestBody Service service) {
        try {
            service.setId(id);
            Service updatedService = serviceService.save(service);
            return ResponseEntity.ok(updatedService);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating service: " + e.getMessage());
        }
    }

    /**
     * Get all feedbacks - This is a placeholder until FeedbackService is properly implemented
     */
    @GetMapping("/feedback")
    public ResponseEntity<?> getAllFeedback() {
        try {
            // This should be replaced with feedbackService.findAll() once implemented
            return ResponseEntity.ok(new ArrayList<Feedback>());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get user statistics
     */
    @GetMapping("/users/stats")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        try {
            Map<String, Object> stats = adminService.getUserStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get all bookings by status
     */
    @GetMapping("/bookings/status/{status}")
    public ResponseEntity<List<Booking>> getBookingsByStatus(@PathVariable String status) {
        try {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            List<Booking> bookings = bookingService.findByStatus(bookingStatus);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
} 