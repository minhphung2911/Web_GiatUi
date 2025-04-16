package com.example.webgiatui.controller;

import com.example.webgiatui.dto.BookingDto;
import com.example.webgiatui.entity.Order;
import com.example.webgiatui.entity.Service;
import com.example.webgiatui.entity.User;
import com.example.webgiatui.service.OrderService;
import com.example.webgiatui.service.ServiceService;
import com.example.webgiatui.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/booking")
public class BookingController {

    private final OrderService orderService;
    private final UserService userService;
    private final ServiceService serviceService;

    @Autowired
    public BookingController(OrderService orderService, UserService userService, ServiceService serviceService) {
        this.orderService = orderService;
        this.userService = userService;
        this.serviceService = serviceService;
    }

    /**
     * Get available services for booking
     */
    @GetMapping("/services")
    public ResponseEntity<List<Service>> getAvailableServices() {
        List<Service> services = serviceService.getAll();
        return ResponseEntity.ok(services);
    }

    /**
     * Create a booking for an authenticated user
     */
    @PostMapping("/user")
    public ResponseEntity<?> createUserBooking(@Valid @RequestBody BookingDto bookingDto) {
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        try {
            // Get service
            Service service = serviceService.getById(bookingDto.getServiceId());
            if (service == null) {
                return ResponseEntity.badRequest().body("Invalid service selected");
            }

            // Create order
            Order order = new Order();
            order.setCustomer(currentUser);
            order.setService(service);
            order.setOrderCode(orderService.generateOrderCode());
            order.setReceivedDate(bookingDto.getDate());
            order.setStatus(Order.OrderStatus.PENDING);
            order.setNote(bookingDto.getNotes());

            // Save order
            Order savedOrder = orderService.create(order);

            // Return created order
            return ResponseEntity.status(HttpStatus.CREATED).body(orderService.convertToDto(savedOrder));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating booking: " + e.getMessage());
        }
    }

    /**
     * Create a booking for a guest user
     */
    @PostMapping("/guest")
    public ResponseEntity<?> createGuestBooking(@Valid @RequestBody BookingDto bookingDto) {
        try {
            // Create or get user
            User guestUser = userService.findByEmail(bookingDto.getEmail());
            
            if (guestUser == null) {
                // Create new user
                User newUser = new User();
                newUser.setName(bookingDto.getName());
                newUser.setEmail(bookingDto.getEmail());
                newUser.setPhoneNumber(bookingDto.getPhone());
                newUser.setAddress(bookingDto.getAddress());
                // Set a temporary password that will not be used (guest can't login)
                newUser.setPassword("GUEST_USER_" + System.currentTimeMillis());
                
                guestUser = userService.create(newUser);
            }

            // Get service
            Service service = serviceService.getById(bookingDto.getServiceId());
            if (service == null) {
                return ResponseEntity.badRequest().body("Invalid service selected");
            }

            // Create order
            Order order = new Order();
            order.setCustomer(guestUser);
            order.setService(service);
            order.setOrderCode(orderService.generateOrderCode());
            order.setReceivedDate(bookingDto.getDate());
            order.setStatus(Order.OrderStatus.PENDING);
            order.setNote(bookingDto.getNotes());

            // Save order
            Order savedOrder = orderService.create(order);

            // Return created order
            Map<String, Object> response = new HashMap<>();
            response.put("order", orderService.convertToDto(savedOrder));
            response.put("message", "Booking created successfully! Please check your email for confirmation.");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating booking: " + e.getMessage());
        }
    }

    /**
     * Check available time slots for a given date
     */
    @GetMapping("/available-slots")
    public ResponseEntity<Map<String, Boolean>> getAvailableTimeSlots(
            @RequestParam("date") String dateStr,
            @RequestParam("serviceId") Long serviceId) {
        
        LocalDate date = LocalDate.parse(dateStr);
        
        // In a real application, you would check the database for booked slots
        // For this example, we'll return mock data
        Map<String, Boolean> availableSlots = new HashMap<>();
        availableSlots.put("09:00", true);
        availableSlots.put("10:00", true);
        availableSlots.put("11:00", false); // This slot is "booked"
        availableSlots.put("12:00", true);
        availableSlots.put("13:00", true);
        availableSlots.put("14:00", false); // This slot is "booked"
        availableSlots.put("15:00", true);
        availableSlots.put("16:00", true);
        availableSlots.put("17:00", true);
        
        return ResponseEntity.ok(availableSlots);
    }
} 