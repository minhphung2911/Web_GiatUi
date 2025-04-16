package com.example.webgiatui.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {

    // Common fields for both guest and user bookings
    @NotNull(message = "Service ID is required")
    private Long serviceId;
    
    @NotNull(message = "Date is required")
    private LocalDate date;
    
    @NotBlank(message = "Time is required")
    private String time;
    
    private String notes;
    
    // Fields specifically for guest bookings
    private String name;
    
    @Email(message = "Email must be valid")
    private String email;
    
    private String phone;
    
    private String address;
} 