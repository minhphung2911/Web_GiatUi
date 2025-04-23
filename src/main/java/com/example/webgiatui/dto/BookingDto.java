package com.example.webgiatui.dto;

import com.example.webgiatui.entity.Booking.BookingStatus;
import com.example.webgiatui.entity.Booking.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {
    
    private Long id;
    
    private String bookingCode;
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    private String userName;
    
    private String userEmail;
    
    private String userPhone;
    
    @NotNull(message = "Service ID is required")
    private Long serviceId;
    
    private String serviceName;
    
    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be positive")
    private Double weight;
    
    @NotNull(message = "Total price is required")
    @Positive(message = "Total price must be positive") 
    private Double totalPrice;
    
    @NotNull(message = "Pickup date is required")
    private LocalDateTime pickupDate;
    
    @NotNull(message = "Delivery date is required")
    private LocalDateTime deliveryDate;
    
    private String address;
    
    private String notes;
    
    private BookingStatus status;
    
    private String paymentMethod;
    
    private PaymentStatus paymentStatus;
    
    private LocalDateTime bookingDate;
    
    private LocalDateTime completionDate;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 