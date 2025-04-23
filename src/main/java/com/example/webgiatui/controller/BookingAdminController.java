package com.example.webgiatui.controller;

import com.example.webgiatui.dto.BookingDto;
import com.example.webgiatui.entity.Booking;
import com.example.webgiatui.entity.Booking.BookingStatus;
import com.example.webgiatui.entity.Booking.PaymentStatus;
import com.example.webgiatui.service.BookingService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/bookings")
public class BookingAdminController {

    private static final Logger logger = LoggerFactory.getLogger(BookingAdminController.class);
    private final BookingService bookingService;

    @Autowired
    public BookingAdminController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Lấy tất cả đơn đặt lịch (cho admin)
     */
    @GetMapping
    public ResponseEntity<?> getAllBookings() {
        try {
            logger.info("Admin: Fetching all bookings");
            List<Booking> bookings = bookingService.findAll();
            logger.info("Admin: Retrieved {} bookings", bookings.size());
            
            List<BookingDto> bookingDtos = bookings.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(bookingDtos);
        } catch (Exception e) {
            logger.error("Admin: Error retrieving bookings: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving bookings");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy chi tiết đơn đặt lịch theo ID (cho admin)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        try {
            logger.info("Admin: Fetching booking with ID: {}", id);
            Booking booking = bookingService.findById(id);
            
            if (booking == null) {
                logger.warn("Admin: Booking not found with ID: {}", id);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Booking not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            logger.info("Admin: Booking found with ID: {}", id);
            return ResponseEntity.ok(convertToDto(booking));
        } catch (Exception e) {
            logger.error("Admin: Error retrieving booking with ID {}: {}", id, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving booking");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Cập nhật trạng thái đơn đặt lịch (cho admin)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        try {
            logger.info("Admin: Updating status for booking ID: {}", id);
            String statusStr = statusUpdate.get("status");
            
            if (statusStr == null || statusStr.isEmpty()) {
                logger.warn("Admin: Missing status in request");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Missing status in request");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            try {
                BookingStatus status = BookingStatus.valueOf(statusStr.toUpperCase());
                Booking updatedBooking = bookingService.updateStatus(id, status);
                
                if (updatedBooking == null) {
                    logger.warn("Admin: Booking not found with ID: {}", id);
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Booking not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
                }
                
                logger.info("Admin: Successfully updated status to {} for booking ID: {}", status, id);
                return ResponseEntity.ok(convertToDto(updatedBooking));
            } catch (IllegalArgumentException e) {
                logger.warn("Admin: Invalid status: {}", statusStr);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid status");
                error.put("message", "Valid statuses are: " + Arrays.toString(BookingStatus.values()));
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        } catch (Exception e) {
            logger.error("Admin: Error updating status for booking ID {}: {}", id, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error updating booking status");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Cập nhật trạng thái thanh toán (cho admin)
     */
    @PutMapping("/{id}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable Long id, @RequestBody Map<String, String> paymentUpdate) {
        try {
            logger.info("Admin: Updating payment status for booking ID: {}", id);
            String statusStr = paymentUpdate.get("status");
            
            if (statusStr == null || statusStr.isEmpty()) {
                logger.warn("Admin: Missing payment status in request");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Missing payment status in request");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            try {
                PaymentStatus status = PaymentStatus.valueOf(statusStr.toUpperCase());
                Booking updatedBooking = bookingService.updatePaymentStatus(id, status);
                
                if (updatedBooking == null) {
                    logger.warn("Admin: Booking not found with ID: {}", id);
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Booking not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
                }
                
                logger.info("Admin: Successfully updated payment status to {} for booking ID: {}", status, id);
                return ResponseEntity.ok(convertToDto(updatedBooking));
            } catch (IllegalArgumentException e) {
                logger.warn("Admin: Invalid payment status: {}", statusStr);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid payment status");
                error.put("message", "Valid payment statuses are: " + Arrays.toString(PaymentStatus.values()));
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        } catch (Exception e) {
            logger.error("Admin: Error updating payment status for booking ID {}: {}", id, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error updating booking payment status");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy thống kê đơn đặt lịch theo trạng thái (cho admin)
     */
    @GetMapping("/stats/status")
    public ResponseEntity<?> getBookingStatsByStatus() {
        try {
            logger.info("Admin: Fetching booking statistics by status");
            List<Booking> bookings = bookingService.findAll();
            
            Map<BookingStatus, Long> stats = new HashMap<>();
            for (BookingStatus status : BookingStatus.values()) {
                long count = bookings.stream()
                        .filter(b -> b.getStatus() == status)
                        .count();
                stats.put(status, count);
            }
            
            // Convert enum keys to strings for better JSON output
            Map<String, Long> result = new HashMap<>();
            stats.forEach((key, value) -> result.put(key.name(), value));
            
            logger.info("Admin: Successfully fetched booking statistics");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Admin: Error fetching booking statistics: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error fetching booking statistics");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy thống kê doanh thu theo tháng (cho admin)
     */
    @GetMapping("/stats/revenue")
    public ResponseEntity<?> getRevenueByMonth() {
        try {
            logger.info("Admin: Fetching revenue statistics by month");
            List<Booking> completedBookings = bookingService.findByStatus(BookingStatus.COMPLETED);
            
            // Get current year
            int currentYear = LocalDate.now().getYear();
            
            // Initialize revenue map for all months
            Map<String, Double> monthlyRevenue = new LinkedHashMap<>();
            for (Month month : Month.values()) {
                monthlyRevenue.put(month.name(), 0.0);
            }
            
            // Calculate revenue for each month
            for (Booking booking : completedBookings) {
                LocalDateTime bookingDate = booking.getCompletionDate() != null ? 
                    booking.getCompletionDate() : booking.getUpdatedAt();
                
                // Only count this year's revenue
                if (bookingDate != null && bookingDate.getYear() == currentYear) {
                    String month = bookingDate.getMonth().name();
                    Double currentRevenue = monthlyRevenue.get(month);
                    monthlyRevenue.put(month, currentRevenue + booking.getTotalPrice());
                }
            }
            
            logger.info("Admin: Successfully fetched revenue statistics");
            return ResponseEntity.ok(monthlyRevenue);
        } catch (Exception e) {
            logger.error("Admin: Error fetching revenue statistics: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error fetching revenue statistics");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Cập nhật ngày hoàn thành đơn (cho admin)
     */
    @PutMapping("/{id}/completion-date")
    public ResponseEntity<?> updateCompletionDate(@PathVariable Long id, @RequestBody Map<String, String> completionDateUpdate) {
        try {
            logger.info("Admin: Updating completion date for booking ID: {}", id);
            String completionDateStr = completionDateUpdate.get("completionDate");
            
            if (completionDateStr == null || completionDateStr.isEmpty()) {
                logger.warn("Admin: Missing completion date in request");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Missing completion date in request");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            try {
                LocalDateTime completionDate = LocalDateTime.parse(completionDateStr);
                Booking booking = bookingService.findById(id);
                
                if (booking == null) {
                    logger.warn("Admin: Booking not found with ID: {}", id);
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Booking not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
                }
                
                booking.setCompletionDate(completionDate);
                Booking updatedBooking = bookingService.save(booking);
                
                logger.info("Admin: Successfully updated completion date to {} for booking ID: {}", completionDate, id);
                return ResponseEntity.ok(convertToDto(updatedBooking));
            } catch (Exception e) {
                logger.warn("Admin: Invalid completion date format: {}", completionDateStr);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid completion date format");
                error.put("message", "Date should be in ISO format (yyyy-MM-ddTHH:mm:ss)");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        } catch (Exception e) {
            logger.error("Admin: Error updating completion date for booking ID {}: {}", id, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error updating booking completion date");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Convert Entity to DTO
     */
    private BookingDto convertToDto(Booking booking) {
        BookingDto dto = BookingDto.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getName())
                .userEmail(booking.getUser().getEmail())
                .userPhone(booking.getUser().getPhoneNumber())
                .serviceId(booking.getService().getId())
                .serviceName(booking.getService().getName())
                .weight(booking.getWeight())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .paymentMethod(booking.getPaymentMethod())
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
        return dto;
    }
} 