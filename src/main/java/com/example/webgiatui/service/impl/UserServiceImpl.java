package com.example.webgiatui.service.impl;

import com.example.webgiatui.dto.UserDto;
import com.example.webgiatui.entity.Role;
import com.example.webgiatui.entity.User;
import com.example.webgiatui.repository.RoleRepository;
import com.example.webgiatui.repository.UserRepository;
import com.example.webgiatui.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void saveUser(UserDto userDto) {
        User user = new User();
        user.setName(userDto.getFirstName() + " " + userDto.getLastName());
        user.setEmail(userDto.getEmail());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        
        // Add address and phone if available
        if (userDto.getAddress() != null) {
            user.setAddress(userDto.getAddress());
        }
        
        if (userDto.getPhoneNumber() != null) {
            user.setPhoneNumber(userDto.getPhoneNumber());
        }
        
        // Assign USER role
        Role role = roleRepository.findByName("ROLE_USER");
        if (role == null) {
            role = checkRoleUserExist();
        }
        user.setRoles(Arrays.asList(role));
        
        userRepository.save(user);
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<UserDto> findAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::convertEntityToDto)
                .collect(Collectors.toList());
    }

    private UserDto convertEntityToDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setFirstName(user.getFirstName());
        userDto.setLastName(user.getLastName());
        userDto.setEmail(user.getEmail());
        userDto.setPhoneNumber(user.getPhoneNumber());
        userDto.setAddress(user.getAddress());
        return userDto;
    }

    private Role checkRoleUserExist() {
        Role role = new Role();
        role.setName("ROLE_USER");
        return roleRepository.save(role);
    }

    @Override
    public List<User> getAll() {
        return userRepository.findAll();
    }

    @Override
    public User create(User entity) {
        // Ensure password is encoded
        if (entity.getPassword() != null && !entity.getPassword().startsWith("$2a$")) {
            entity.setPassword(passwordEncoder.encode(entity.getPassword()));
        }
        
        // Ensure user has a role
        if (entity.getRoles() == null || entity.getRoles().isEmpty()) {
            Role role = roleRepository.findByName("ROLE_USER");
            if (role == null) {
                role = checkRoleUserExist();
            }
            entity.setRoles(Arrays.asList(role));
        }
        
        return userRepository.save(entity);
    }

    @Override
    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Override
    public User update(Long id, User entity) {
        User existingUser = getById(id);
        
        // Update fields that are provided
        if (entity.getName() != null) {
            existingUser.setName(entity.getName());
        }
        
        if (entity.getEmail() != null) {
            existingUser.setEmail(entity.getEmail());
        }
        
        if (entity.getPassword() != null && !entity.getPassword().startsWith("$2a$")) {
            existingUser.setPassword(passwordEncoder.encode(entity.getPassword()));
        }
        
        if (entity.getPhoneNumber() != null) {
            existingUser.setPhoneNumber(entity.getPhoneNumber());
        }
        
        if (entity.getAddress() != null) {
            existingUser.setAddress(entity.getAddress());
        }
        
        if (entity.getRoles() != null && !entity.getRoles().isEmpty()) {
            existingUser.setRoles(entity.getRoles());
        }
        
        return userRepository.save(existingUser);
    }

    @Override
    public void delete(Long id) {
        userRepository.deleteById(id);
    }
}
