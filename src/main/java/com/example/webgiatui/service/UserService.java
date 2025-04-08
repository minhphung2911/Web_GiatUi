package com.example.webgiatui.service;

import com.example.webgiatui.dto.UserDto;
import com.example.webgiatui.entity.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface UserService extends GenericService<User> {
    @Override
    List<User> getAll();

    @Override
    User create(User entity);

    @Override
    User getById(Long id);

    @Override
    User update(Long id, User entity);

    @Override
    void delete(Long id);

    // Custom methods
    void saveUser(UserDto userDto);

    User findByEmail(String email);

    List<UserDto> findAllUsers();
}
