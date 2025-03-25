package com.example.webgiatui.service;


import com.example.webgiatui.dto.UserDto;
import com.example.webgiatui.entity.User;

import java.util.List;

public interface UserService {
    void saveUser(UserDto userDto);

    User findByEmail(String email);

    List<UserDto> findAllUsers();
}
