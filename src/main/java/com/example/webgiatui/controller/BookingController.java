package com.example.webgiatui.controller;

import com.example.webgiatui.dto.BookingDto;
import com.example.webgiatui.dto.BookingRequest;
import com.example.webgiatui.dto.TimeSlotDto;
import com.example.webgiatui.entity.Booking;
import com.example.webgiatui.entity.Booking.BookingStatus;
import com.example.webgiatui.entity.Booking.PaymentStatus;
import com.example.webgiatui.entity.Service;
import com.example.webgiatui.entity.User;
import com.example.webgiatui.service.BookingService;
import com.example.webgiatui.service.ServiceService;
import com.example.webgiatui.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);
    private final BookingService bookingService;
    private final UserService userService;
    private final ServiceService serviceService;

    @Autowired
    public BookingController(BookingService bookingService, UserService userService, ServiceService serviceService) {
        this.bookingService = bookingService;
        this.userService = userService;
        this.serviceService = serviceService;
    }

    /**
     * Tạo mới đơn đặt lịch
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest request) {
        try {
            logger.info("Creating new booking for user ID: {}", request.getUserId());
            
            // Validate User
            User user = userService.findById(request.getUserId());
            if (user == null) {
                logger.warn("User not found with ID: {}", request.getUserId());
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            // Validate Service
            Service service = serviceService.findById(request.getServiceId());
            if (service == null) {
                logger.warn("Service not found with ID: {}", request.getServiceId());
                Map<String, String> error = new HashMap<>();
                error.put("error", "Service not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            // Validate date ranges
            if (request.getPickupDate() == null || request.getDeliveryDate() == null) {
                logger.warn("Missing pickup or delivery date");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Pickup and delivery dates are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            if (request.getPickupDate().isAfter(request.getDeliveryDate())) {
                logger.warn("Invalid date range: pickup date is after delivery date");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Pickup date cannot be after delivery date");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Calculate price
            double pricePerKg = service.getPricePerKg();
            double totalPrice = request.getWeight() * pricePerKg;
            
            // Build booking entity
            Booking booking = Booking.builder()
                    .bookingCode(generateBookingCode())
                    .user(user)
                    .service(service)
                    .weight(request.getWeight())
                    .totalPrice(totalPrice)
                    .pickupDate(request.getPickupDate())
                    .deliveryDate(request.getDeliveryDate())
                    .address(request.getAddress())
                    .notes(request.getNotes())
                    .status(BookingStatus.PENDING)
                    .paymentMethod(request.getPaymentMethod().name())
                    .paymentStatus(Booking.PaymentStatus.PENDING)
                    .bookingDate(LocalDateTime.now())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            
            // Save booking
            Booking savedBooking = bookingService.save(booking);
            logger.info("Successfully created booking with ID: {}", savedBooking.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedBooking));
        } catch (Exception e) {
            logger.error("Error creating booking: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error creating booking");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy chi tiết đơn đặt lịch theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        try {
            logger.info("Fetching booking with ID: {}", id);
            Booking booking = bookingService.findById(id);
            
            if (booking == null) {
                logger.warn("Booking not found with ID: {}", id);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Booking not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            logger.info("Booking found with ID: {}", id);
            return ResponseEntity.ok(convertToDto(booking));
        } catch (Exception e) {
            logger.error("Error retrieving booking with ID {}: {}", id, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving booking");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy danh sách đơn đặt lịch của một người dùng
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBookings(@PathVariable Long userId) {
        try {
            logger.info("Fetching bookings for user ID: {}", userId);
            
            // Validate user exists
            User user = userService.findById(userId);
            if (user == null) {
                logger.warn("User not found with ID: {}", userId);
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            List<Booking> bookings = bookingService.findByUserId(userId);
            logger.info("Retrieved {} bookings for user ID: {}", bookings.size(), userId);
            
            List<BookingDto> bookingDtos = bookings.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(bookingDtos);
        } catch (Exception e) {
            logger.error("Error retrieving bookings for user ID {}: {}", userId, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving user bookings");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Cập nhật thông tin đơn đặt lịch
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(@PathVariable Long id, @Valid @RequestBody BookingRequest request) {
        try {
            logger.info("Updating booking with ID: {}", id);
            
            // Validate booking exists
            Booking booking = bookingService.findById(id);
            if (booking == null) {
                logger.warn("Booking not found with ID: {}", id);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Booking not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            // Only allow updates for pending bookings
            if (booking.getStatus() != BookingStatus.PENDING) {
                logger.warn("Cannot update booking with ID: {} because it's not in PENDING status", id);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Cannot update booking that is not in PENDING status");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Validate Service if changed
            Service service = booking.getService();
            if (!request.getServiceId().equals(service.getId())) {
                service = serviceService.findById(request.getServiceId());
                if (service == null) {
                    logger.warn("Service not found with ID: {}", request.getServiceId());
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Service not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
                }
                booking.setService(service);
            }
            
            // Validate date ranges
            if (request.getPickupDate() == null || request.getDeliveryDate() == null) {
                logger.warn("Missing pickup or delivery date");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Pickup and delivery dates are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            if (request.getPickupDate().isAfter(request.getDeliveryDate())) {
                logger.warn("Invalid date range: pickup date is after delivery date");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Pickup date cannot be after delivery date");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Update booking properties
            booking.setWeight(request.getWeight());
            booking.setTotalPrice(request.getWeight() * service.getPricePerKg());
            booking.setPickupDate(request.getPickupDate());
            booking.setDeliveryDate(request.getDeliveryDate());
            booking.setAddress(request.getAddress());
            booking.setNotes(request.getNotes());
            booking.setPaymentMethod(request.getPaymentMethod().name());
            booking.setUpdatedAt(LocalDateTime.now());
            
            // Save updated booking
            Booking updatedBooking = bookingService.save(booking);
            logger.info("Successfully updated booking with ID: {}", updatedBooking.getId());
            
            return ResponseEntity.ok(convertToDto(updatedBooking));
        } catch (Exception e) {
            logger.error("Error updating booking with ID {}: {}", id, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error updating booking");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Hủy đơn đặt lịch
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            logger.info("Cancelling booking with ID: {}", id);
            
            // Validate booking exists
            Booking booking = bookingService.findById(id);
            if (booking == null) {
                logger.warn("Booking not found with ID: {}", id);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Booking not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            // Only allow cancellation for bookings in PENDING or CONFIRMED status
            if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.CONFIRMED) {
                logger.warn("Cannot cancel booking with ID: {} because it's not in PENDING or CONFIRMED status", id);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Cannot cancel booking that is not in PENDING or CONFIRMED status");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Update booking status to CANCELLED
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setUpdatedAt(LocalDateTime.now());
            
            // Save updated booking
            Booking cancelledBooking = bookingService.save(booking);
            logger.info("Successfully cancelled booking with ID: {}", cancelledBooking.getId());
            
            return ResponseEntity.ok(convertToDto(cancelledBooking));
        } catch (Exception e) {
            logger.error("Error cancelling booking with ID {}: {}", id, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error cancelling booking");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Tính toán giá tiền dựa trên dịch vụ và cân nặng
     */
    @PostMapping("/calculate-price")
    public ResponseEntity<?> calculatePrice(@RequestBody Map<String, Object> request) {
        try {
            logger.info("Calculating price for booking request: {}", request);
            
            // Extract and validate service ID
            Long serviceId = Long.valueOf(request.get("serviceId").toString());
            Service service = serviceService.findById(serviceId);
            if (service == null) {
                logger.warn("Service not found with ID: {}", serviceId);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Service not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            // Extract and validate weight
            Double weight = Double.valueOf(request.get("weight").toString());
            if (weight <= 0) {
                logger.warn("Invalid weight: {}", weight);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Weight must be greater than 0");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Calculate price
            double pricePerKg = service.getPricePerKg();
            double totalPrice = weight * pricePerKg;
            
            Map<String, Object> result = new HashMap<>();
            result.put("serviceName", service.getName());
            result.put("pricePerKg", pricePerKg);
            result.put("weight", weight);
            result.put("totalPrice", totalPrice);
            
            logger.info("Successfully calculated price: {}", result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error calculating price: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error calculating price");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy danh sách khung giờ có sẵn cho ngày cụ thể
     */
    @GetMapping("/time-slots")
    public ResponseEntity<?> getAvailableTimeSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            logger.info("Fetching available time slots for date: {}", date);
            
            // Check if date is in the past
            if (date.isBefore(LocalDate.now())) {
                logger.warn("Requested date is in the past: {}", date);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Cannot check availability for past dates");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Get bookings for the specified date
            List<Booking> bookingsOnDate = bookingService.findByPickupDate(
                LocalDateTime.of(date, LocalTime.MIDNIGHT)
            );
            
            // Define time slots (8 AM to 6 PM, hourly)
            List<TimeSlotDto> timeSlots = new ArrayList<>();
            for (int hour = 8; hour <= 18; hour++) {
                LocalTime startTime = LocalTime.of(hour, 0);
                LocalTime endTime = LocalTime.of(hour + 1, 0);
                
                // Check if time slot is available (max 2 bookings per hour)
                long bookingsInSlot = bookingsOnDate.stream()
                        .filter(b -> {
                            LocalTime pickupTime = b.getPickupDate().toLocalTime();
                            return pickupTime.equals(startTime) || 
                                   (pickupTime.isAfter(startTime) && pickupTime.isBefore(endTime));
                        })
                        .count();
                
                boolean isAvailable = bookingsInSlot < 2;
                
                // For past hours of today, mark as unavailable
                if (date.isEqual(LocalDate.now()) && startTime.isBefore(LocalTime.now())) {
                    isAvailable = false;
                }
                
                TimeSlotDto slot = new TimeSlotDto();
                slot.setStartTime(startTime);
                slot.setEndTime(endTime);
                slot.setAvailable(isAvailable);
                
                timeSlots.add(slot);
            }
            
            logger.info("Successfully fetched {} time slots for date: {}", timeSlots.size(), date);
            return ResponseEntity.ok(timeSlots);
        } catch (Exception e) {
            logger.error("Error fetching time slots for date {}: {}", date, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error fetching time slots");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Helper method to generate a unique booking code
     */
    private String generateBookingCode() {
        String prefix = "GU";
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
        String random = String.valueOf(new Random().nextInt(900) + 100);
        return prefix + timestamp + random;
    }

    /**
     * Convert Entity to DTO
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
                .pickupDate(booking.getPickupDate())
                .deliveryDate(booking.getDeliveryDate())
                .address(booking.getAddress())
                .notes(booking.getNotes())
                .status(booking.getStatus())
                .paymentMethod(booking.getPaymentMethod())
                .paymentStatus(booking.getPaymentStatus())
                .bookingDate(booking.getBookingDate())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
} 