package com.example.webgiatui.controller;

import com.example.webgiatui.dto.AuthRequestDto;
import com.example.webgiatui.dto.AuthResponseDto;
import com.example.webgiatui.dto.UserDto;
import com.example.webgiatui.entity.User;
import com.example.webgiatui.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthRestController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthRestController(UserService userService, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        
        // Create test users if none exist
        try {
            if (userService.findAll().isEmpty()) {
                log.info("Creating test users...");
                
                // Create test user
                UserDto testUser = new UserDto();
                testUser.setFirstName("Test");
                testUser.setLastName("User");
                testUser.setEmail("test@example.com");
                testUser.setPassword("password");
                testUser.setPhoneNumber("0987654321");
                testUser.setAddress("123 Test Street");
                userService.saveUser(testUser);
                
                log.info("Test user created: {}", testUser.getEmail());
            }
        } catch (Exception e) {
            log.error("Error creating test users: {}", e.getMessage(), e);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody AuthRequestDto request) {
        try {
            log.info("Login attempt for email: {}", request.getEmail());
            
            // Validate input
            if (request.getEmail() == null || request.getEmail().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(AuthResponseDto.builder()
                                .success(false)
                                .message("Email không được để trống")
                                .build());
            }
            
            if (request.getPassword() == null || request.getPassword().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(AuthResponseDto.builder()
                                .success(false)
                                .message("Mật khẩu không được để trống")
                                .build());
            }
            
            // Check if user exists first
            User user = userService.findByEmail(request.getEmail());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(AuthResponseDto.builder()
                                .success(false)
                                .message("Email không tồn tại")
                                .build());
            }
            
            // Authenticate user with Spring Security
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            // Set the authentication in the SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
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
            
            log.info("Login successful for user: {}", user.getEmail());
            
            // Return success response
            return ResponseEntity.ok(AuthResponseDto.builder()
                    .success(true)
                    .user(userDto)
                    .token(token)
                    .message("Đăng nhập thành công")
                    .build());
                    
        } catch (BadCredentialsException e) {
            log.error("Bad credentials for login attempt: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponseDto.builder()
                            .success(false)
                            .message("Email hoặc mật khẩu không đúng")
                            .build());
        } catch (AuthenticationException e) {
            log.error("Authentication error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponseDto.builder()
                            .success(false)
                            .message("Lỗi xác thực: " + e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthResponseDto.builder()
                            .success(false)
                            .message("Đã xảy ra lỗi: " + e.getMessage())
                            .build());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@RequestBody UserDto userDto) {
        try {
            log.info("Registration attempt for email: {}", userDto.getEmail());
            
            // Basic validation
            if (userDto.getEmail() == null || userDto.getEmail().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(AuthResponseDto.builder()
                                .success(false)
                                .message("Email không được để trống")
                                .build());
            }
            
            if (userDto.getPassword() == null || userDto.getPassword().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(AuthResponseDto.builder()
                                .success(false)
                                .message("Mật khẩu không được để trống")
                                .build());
            }
            
            if (userDto.getPassword().length() < 6) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(AuthResponseDto.builder()
                                .success(false)
                                .message("Mật khẩu phải có ít nhất 6 ký tự")
                                .build());
            }
            
            if (userDto.getFirstName() == null || userDto.getFirstName().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(AuthResponseDto.builder()
                                .success(false)
                                .message("Tên không được để trống")
                                .build());
            }
            
            // Check if user already exists
            User existingUser = userService.findByEmail(userDto.getEmail());
            if (existingUser != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(AuthResponseDto.builder()
                                .success(false)
                                .message("Email đã được sử dụng")
                                .build());
            }
            
            // Set name from first and last name if not set
            if (userDto.getName() == null || userDto.getName().isEmpty()) {
                userDto.setName(userDto.getFirstName() + " " + (userDto.getLastName() != null ? userDto.getLastName() : ""));
            }
            
            // Save the new user
            userService.saveUser(userDto);
            log.info("User registration successful for: {}", userDto.getEmail());
            
            // Get the newly created user
            User newUser = userService.findByEmail(userDto.getEmail());
            
            // Convert to DTO for response
            UserDto newUserDto = new UserDto();
            newUserDto.setId(newUser.getId());
            newUserDto.setEmail(newUser.getEmail());
            newUserDto.setFirstName(userDto.getFirstName());
            newUserDto.setLastName(userDto.getLastName());
            newUserDto.setPhoneNumber(newUser.getPhoneNumber());
            newUserDto.setAddress(newUser.getAddress());
            
            // Return success response
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(AuthResponseDto.builder()
                            .success(true)
                            .user(newUserDto)
                            .message("Đăng ký tài khoản thành công")
                            .build());
                            
        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage(), e);
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
    
    @PostMapping("/check-user")
    public ResponseEntity<AuthResponseDto> checkUser(@RequestBody AuthRequestDto request) {
        try {
            log.info("Checking if user exists: {}", request.getEmail());
            
            // Validate input
            if (request.getEmail() == null || request.getEmail().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(AuthResponseDto.builder()
                                .success(false)
                                .message("Email không được để trống")
                                .build());
            }
            
            // Check if user exists
            User user = userService.findByEmail(request.getEmail());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(AuthResponseDto.builder()
                                .success(false)
                                .message("Không tìm thấy người dùng với email: " + request.getEmail())
                                .build());
            }
            
            // Convert to DTO
            UserDto userDto = new UserDto();
            userDto.setId(user.getId());
            userDto.setEmail(user.getEmail());
            userDto.setFirstName(user.getFirstName());
            userDto.setLastName(user.getLastName());
            userDto.setPhoneNumber(user.getPhoneNumber());
            userDto.setAddress(user.getAddress());
            
            log.info("User found: {} ({})", user.getEmail(), user.getId());
            
            // Return user info
            return ResponseEntity.ok(AuthResponseDto.builder()
                    .success(true)
                    .user(userDto)
                    .message("Người dùng tồn tại")
                    .build());
                    
        } catch (Exception e) {
            log.error("Error checking user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthResponseDto.builder()
                            .success(false)
                            .message("Đã xảy ra lỗi: " + e.getMessage())
                            .build());
        }
    }
} 