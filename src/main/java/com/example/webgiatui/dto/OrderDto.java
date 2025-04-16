package com.example.webgiatui.dto;

import com.example.webgiatui.entity.Order.OrderStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto extends BaseDto {
    private Long id;
    
    private String orderCode;
    
    @NotNull(message = "Khách hàng không được để trống")
    private Long customerId;
    
    @NotNull(message = "Dịch vụ không được để trống")
    private Long serviceId;
    
    private String serviceName;
    
    @Positive(message = "Cân nặng phải lớn hơn 0")
    private Double weight;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate receivedDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate returnDate;
    
    private OrderStatus status;
    
    private String note;
    
    // Customer information - for display purposes
    private String customerName;
    private String customerEmail;
    private String customerPhone;
} 