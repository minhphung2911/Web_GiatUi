package com.example.webgiatui.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class ViewController {

    @GetMapping("/")
    public String index() {
        return "index";
    }
    
    @GetMapping("/index")
    public String indexAlternative() {
        return "index";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    @GetMapping("/feedbacks")
    public String feedbacks() {
        return "feedbacks";
    }
    
    @GetMapping("/feedback/create")
    public String createFeedback() {
        return "create-feedback";
    }
    
    @GetMapping("/feedback/{id}")
    public String viewFeedback(@PathVariable Long id) {
        return "view-feedback";
    }
    
    @GetMapping("/services")
    public String services() {
        return "services";
    }
    
    @GetMapping("/service-details")
    public String serviceDetails() {
        return "service-details";
    }
    
    @GetMapping("/contact")
    public String contact() {
        return "contact";
    }
    
    @GetMapping("/about")
    public String about() {
        return "about";
    }
    
    @GetMapping("/admin-dashboard")
    public String adminDashboard() {
        return "admin-dashboard";
    }

    @GetMapping("/admin-login")
    public String adminLogin() {
        return "admin-login";
    }
    
    @GetMapping("/admin/users")
    public String adminUsers() {
        return "admin-users";
    }
    
    @GetMapping("/admin/bookings")
    public String adminBookings() {
        return "admin-bookings";
    }
    
    @GetMapping("/admin/feedbacks")
    public String adminFeedbacks() {
        return "admin-feedbacks";
    }
    
    @GetMapping("/admin/services")
    public String adminServices() {
        return "admin-services";
    }
} 