package com.example.webgiatui.service;

import com.example.webgiatui.entity.Order;
import java.util.List;

public interface OrderService {
    List<Order> getAllOrders();

    Order createOrder(Order order);

    Order updateOrder(Long id, Order orderDetails);
}