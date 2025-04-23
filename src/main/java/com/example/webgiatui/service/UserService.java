package com.example.webgiatui.service;

import com.example.webgiatui.dto.UserDto;
import com.example.webgiatui.entity.User;

import java.util.List;

public interface UserService {
    /**
     * Get all users
     * @return list of all users
     */
    List<User> findAll();

    /**
     * Find user by ID
     * @param id user ID
     * @return user if found, null otherwise
     */
    User findById(Long id);

    /**
     * Find user by email
     * @param email user email
     * @return user if found, null otherwise
     */
    User findByEmail(String email);

    /**
     * Save or update user
     * @param user user to save or update
     * @return saved or updated user
     */
    User save(User user);

    /**
     * Save user from DTO
     * @param userDto user DTO
     */
    void saveUser(UserDto userDto);

    /**
     * Find all users as DTOs
     * @return list of all user DTOs
     */
    List<UserDto> findAllUsers();

    /**
     * Delete user
     * @param id user ID
     */
    void delete(Long id);
} 