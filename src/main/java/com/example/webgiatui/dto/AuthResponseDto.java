package com.example.webgiatui.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDto {
    private UserDto user;
    private String token;
    private String message;
    private boolean success;
} 