package com.example.webgiatui.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequestDto {
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
    
    private boolean remember;
    
    /**
     * This setter allows the DTO to accept 'username' field from the form
     * and map it to the 'email' field
     */
    @JsonProperty("username")
    public void setUsername(String username) {
        this.email = username;
    }
} 