package com.example.webgiatui.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    /**
     * Display profile page
     * @return profile view
     */
    @GetMapping("/profile")
    public String profile() {
        return "profile";
    }
    
    /**
     * Display booking page
     * @return booking view
     */
    @GetMapping("/booking")
    public String booking() {
        return "booking";
    }
    
    /**
     * Display orders page
     * @return orders view
     */
    @GetMapping("/orders")
    public String orders() {
        return "orders";
    }
    
    /**
     * Display user register page
     * @return register view
     */
    @GetMapping("/user/register")
    public String userRegister() {
        return "register";
    }
} 