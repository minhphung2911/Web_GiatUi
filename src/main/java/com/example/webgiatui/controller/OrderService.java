package com.example.webgiatui.controller;

import com.example.webgiatui.entity.Order;
import java.util.List;

public class OrderService {
    public List<Order> getAllOrders() {
        return List.of();
    }

    public Order createOrder(Order order) {
        return order;
    }

    public Order updateOrder(Long id, Order orderDetails) {
        return orderDetails;
    }

}
