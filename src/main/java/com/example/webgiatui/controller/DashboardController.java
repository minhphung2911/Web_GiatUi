package com.example.webgiatui.controller;

import com.example.webgiatui.dto.BookingDto;
import com.example.webgiatui.entity.Booking;
import com.example.webgiatui.entity.Booking.BookingStatus;
import com.example.webgiatui.entity.User;
import com.example.webgiatui.service.BookingService;
import com.example.webgiatui.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final BookingService bookingService;
    private final UserService userService;

    @Autowired
    public DashboardController(BookingService bookingService, UserService userService) {
        this.bookingService = bookingService;
        this.userService = userService;
    }

    /**
     * Get dashboard summary for the currently authenticated user
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        // Get current user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);

        if (currentUser == null) {
            return ResponseEntity.badRequest().build();
        }

        // Get user's bookings
        List<Booking> userBookings = bookingService.findByUserId(currentUser.getId());
        
        // Convert to DTOs
        List<BookingDto> bookingDtos = userBookings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        // Count upcoming bookings (those with status PENDING or PROCESSING)
        long upcomingCount = userBookings.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.PENDING || 
                                booking.getStatus() == BookingStatus.PROCESSING)
                .count();

        // Count completed bookings
        long completedCount = userBookings.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.COMPLETED)
                .count();

        // Calculate total spent
        double totalSpent = userBookings.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.COMPLETED)
                .mapToDouble(Booking::getTotalPrice)
                .sum();
        
        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("user", currentUser.getName());
        response.put("upcomingCount", upcomingCount);
        response.put("completedCount", completedCount);
        response.put("totalSpent", totalSpent);
        response.put("bookings", bookingDtos);

        return ResponseEntity.ok(response);
    }

    /**
     * Get user's upcoming bookings
     */
    @GetMapping("/upcoming-bookings")
    public ResponseEntity<List<BookingDto>> getUpcomingBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);

        if (currentUser == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Booking> upcomingBookings = bookingService.findByUserId(currentUser.getId()).stream()
                .filter(booking -> booking.getStatus() == BookingStatus.PENDING || 
                               booking.getStatus() == BookingStatus.PROCESSING)
                .collect(Collectors.toList());
                
        List<BookingDto> bookingDtos = upcomingBookings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(bookingDtos);
    }

    /**
     * Get user's completed bookings
     */
    @GetMapping("/completed-bookings")
    public ResponseEntity<List<BookingDto>> getCompletedBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);

        if (currentUser == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Booking> completedBookings = bookingService.findByUserId(currentUser.getId()).stream()
                .filter(booking -> booking.getStatus() == BookingStatus.COMPLETED)
                .collect(Collectors.toList());
                
        List<BookingDto> bookingDtos = completedBookings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(bookingDtos);
    }
    
    /**
     * Convert Booking entity to BookingDto
     */
    private BookingDto convertToDto(Booking booking) {
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
    }
} 