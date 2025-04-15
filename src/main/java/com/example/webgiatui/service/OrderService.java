package com.example.webgiatui.service;

import com.example.webgiatui.dto.OrderDto;
import com.example.webgiatui.entity.Order;
import com.example.webgiatui.entity.Order.OrderStatus;

import java.util.List;

public interface OrderService extends GenericService<Order> {
    
    /**
     * Find all orders in the system
     */
    @Override
    List<Order> getAll();
    
    /**
     * Create a new order
     */
    @Override
    Order create(Order order);
    
    /**
     * Get order by ID
     */
    @Override
    Order getById(Long id);
    
    /**
     * Update an existing order
     */
    @Override
    Order update(Long id, Order order);
    
    /**
     * Delete an order
     */
    @Override
    void delete(Long id);
    
    /**
     * Find orders by customer ID
     */
    List<Order> findByCustomerId(Long customerId);
    
    /**
     * Find orders by status
     */
    List<Order> findByStatus(OrderStatus status);
    
    /**
     * Update order status
     */
    Order updateStatus(Long id, OrderStatus status);
    
    /**
     * Convert Order entity to OrderDto
     */
    OrderDto convertToDto(Order order);
    
    /**
     * Convert OrderDto to Order entity
     */
    Order convertToEntity(OrderDto orderDto);
    
    /**
     * Find all orders and convert to DTOs
     */
    List<OrderDto> getAllOrderDtos();
    
    /**
     * Generate a unique order code
     */
    String generateOrderCode();
}