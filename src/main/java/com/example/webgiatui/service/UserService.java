package com.example.webgiatui.service;


import com.example.webgiatui.dto.UserDto;
import com.example.webgiatui.entity.User;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public interface UserService {
    void saveUser(UserDto userDto);

    User findByEmail(String email);

    List<UserDto> findAllUsers();
}
