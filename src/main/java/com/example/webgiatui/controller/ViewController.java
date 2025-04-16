package com.example.webgiatui.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    // Removing the index method since it conflicts with AuthController's home() method
    // @GetMapping("/")
    // public String index() {
    //     return "index";
    // }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    @GetMapping("/profile")
    public String profile() {
        return "profile";
    }

    @GetMapping("/booking")
    public String booking() {
        return "booking";
    }

    @GetMapping("/orders")
    public String orders() {
        return "orders";
    }

    @GetMapping("/admin-dashboard")
    public String adminDashboard() {
        return "admin-dashboard";
    }

    @GetMapping("/admin-login")
    public String adminLogin() {
        return "admin-login";
    }
} 