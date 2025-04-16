package com.example.webgiatui.repository;

import com.example.webgiatui.entity.Order;
import com.example.webgiatui.entity.Order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    /**
     * Find orders by customer ID
     */
    List<Order> findByCustomerId(Long customerId);
    
    /**
     * Find orders by status
     */
    List<Order> findByStatus(OrderStatus status);
    
    /**
     * Find by order code
     */
    Order findByOrderCode(String orderCode);
} 