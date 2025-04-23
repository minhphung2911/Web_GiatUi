package com.example.webgiatui.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    
    public enum PaymentMethod {
        CASH, CARD, BANKING
    }
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotNull(message = "Service ID is required")
    private Long serviceId;
    
    @NotNull(message = "Weight is required")
    @Min(value = 0, message = "Weight must be greater than 0")
    private Double weight;
    
    @NotNull(message = "Pickup date is required")
    private LocalDateTime pickupDate;
    
    @NotNull(message = "Delivery date is required")
    private LocalDateTime deliveryDate;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    private String notes;
    
    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
} 