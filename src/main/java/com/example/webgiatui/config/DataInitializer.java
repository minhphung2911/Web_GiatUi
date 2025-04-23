package com.example.webgiatui.config;

import com.example.webgiatui.entity.Role;
import com.example.webgiatui.entity.User;
import com.example.webgiatui.repository.RoleRepository;
import com.example.webgiatui.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataInitializer(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Check if we already have users
        if (userRepository.count() > 0) {
            log.info("Database already has data, skipping initialization");
            return;
        }

        log.info("Initializing database with test data");
        
        // Create roles if they don't exist
        Role adminRole = roleRepository.findByName("ROLE_ADMIN");
        if (adminRole == null) {
            adminRole = new Role();
            adminRole.setName("ROLE_ADMIN");
            adminRole = roleRepository.save(adminRole);
            log.info("Created ADMIN role");
        }
        
        Role userRole = roleRepository.findByName("ROLE_USER");
        if (userRole == null) {
            userRole = new Role();
            userRole.setName("ROLE_USER");
            userRole = roleRepository.save(userRole);
            log.info("Created USER role");
        }
        
        // Create admin user
        User admin = new User();
        admin.setName("Admin User");
        admin.setEmail("admin@example.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setPhoneNumber("0123456789");
        admin.setAddress("123 Admin Street, HCM City");
        admin.setRoles(Arrays.asList(adminRole));
        userRepository.save(admin);
        
        // Create test users
        User user1 = new User();
        user1.setName("Test User");
        user1.setEmail("user@example.com");
        user1.setPassword(passwordEncoder.encode("password"));
        user1.setPhoneNumber("0987654321");
        user1.setAddress("456 User Street, HCM City");
        user1.setRoles(Arrays.asList(userRole));
        userRepository.save(user1);
        
        User user2 = new User();
        user2.setName("Nguyen Van A");
        user2.setEmail("nguyenvana@example.com");
        user2.setPassword(passwordEncoder.encode("password"));
        user2.setPhoneNumber("0909123456");
        user2.setAddress("789 Nguyen Hue, HCM City");
        user2.setRoles(Arrays.asList(userRole));
        userRepository.save(user2);
        
        log.info("Created 3 test users");
    }
} 