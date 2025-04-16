package com.example.webgiatui.controller;

import com.example.webgiatui.dto.OrderDto;
import com.example.webgiatui.dto.UserDto;
import com.example.webgiatui.entity.Order;
import com.example.webgiatui.entity.User;
import com.example.webgiatui.service.OrderService;
import com.example.webgiatui.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final OrderService orderService;
    private final UserService userService;

    @Autowired
    public DashboardController(OrderService orderService, UserService userService) {
        this.orderService = orderService;
        this.userService = userService;
    }

    /**
     * Get dashboard summary for the currently authenticated user
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        // Get current user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);

        if (currentUser == null) {
            return ResponseEntity.badRequest().build();
        }

        // Get user's orders
        List<Order> userOrders = orderService.findByCustomerId(currentUser.getId());
        
        // Convert to DTOs
        List<OrderDto> orderDtos = userOrders.stream()
                .map(orderService::convertToDto)
                .toList();

        // Count upcoming orders (those with status PENDING or WASHING)
        long upcomingCount = userOrders.stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.PENDING || 
                                order.getStatus() == Order.OrderStatus.WASHING)
                .count();

        // Count completed orders
        long completedCount = userOrders.stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
                .count();

        // Calculate total spent (would come from an actual database calculation)
        double totalSpent = 0.0;
        // This is a placeholder - in a real app, you would calculate this from actual order values
        
        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("user", currentUser.getName());
        response.put("upcomingCount", upcomingCount);
        response.put("completedCount", completedCount);
        response.put("totalSpent", totalSpent);
        response.put("orders", orderDtos);

        return ResponseEntity.ok(response);
    }

    /**
     * Get user's upcoming orders
     */
    @GetMapping("/upcoming-orders")
    public ResponseEntity<List<OrderDto>> getUpcomingOrders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);

        if (currentUser == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Order> upcomingOrders = orderService.findByCustomerId(currentUser.getId()).stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.PENDING || 
                               order.getStatus() == Order.OrderStatus.WASHING)
                .toList();
                
        List<OrderDto> orderDtos = upcomingOrders.stream()
                .map(orderService::convertToDto)
                .toList();

        return ResponseEntity.ok(orderDtos);
    }

    /**
     * Get user's completed orders
     */
    @GetMapping("/completed-orders")
    public ResponseEntity<List<OrderDto>> getCompletedOrders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);

        if (currentUser == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Order> completedOrders = orderService.findByCustomerId(currentUser.getId()).stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
                .toList();
                
        List<OrderDto> orderDtos = completedOrders.stream()
                .map(orderService::convertToDto)
                .toList();

        return ResponseEntity.ok(orderDtos);
    }
} 