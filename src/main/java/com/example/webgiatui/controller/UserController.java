package com.example.webgiatui.controller;

import com.example.webgiatui.entity.User;
import com.example.webgiatui.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController extends BaseController<User, UserService> {
    // Thêm các endpoint đặc biệt cho user nếu cần

    @Autowired
    public UserController(UserService service) {
        super(service);
    }
}
