package com.example.webgiatui.controller;

import com.example.webgiatui.dto.AuthRequestDto;
import com.example.webgiatui.dto.AuthResponseDto;
import com.example.webgiatui.dto.UserDto;
import com.example.webgiatui.entity.User;
import com.example.webgiatui.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthRestController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthRestController(UserService userService, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody AuthRequestDto request) {
        try {
            // Authenticate user with Spring Security
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            // Set the authentication in the SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Get user details
            User user = userService.findByEmail(request.getEmail());
            
            // Convert to DTO
            UserDto userDto = new UserDto();
            String[] names = user.getName().split(" ", 2);
            userDto.setId(user.getId());
            userDto.setEmail(user.getEmail());
            userDto.setFirstName(names.length > 0 ? names[0] : "");
            userDto.setLastName(names.length > 1 ? names[1] : "");
            userDto.setPhoneNumber(user.getPhoneNumber());
            userDto.setAddress(user.getAddress());
            
            // Generate simple token if needed
            String token = request.isRemember() ? UUID.randomUUID().toString() : null;
            
            // Return success response
            return ResponseEntity.ok(AuthResponseDto.builder()
                    .success(true)
                    .user(userDto)
                    .token(token)
                    .message("Đăng nhập thành công")
                    .build());
                    
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponseDto.builder()
                            .success(false)
                            .message("Email hoặc mật khẩu không đúng")
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthResponseDto.builder()
                            .success(false)
                            .message("Đã xảy ra lỗi: " + e.getMessage())
                            .build());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponseDto> logout() {
        // In a real implementation, you might want to invalidate the token
        // For now, just return success as the client clears local storage
        return ResponseEntity.ok(AuthResponseDto.builder()
                .success(true)
                .message("Đăng xuất thành công")
                .build());
    }
} 