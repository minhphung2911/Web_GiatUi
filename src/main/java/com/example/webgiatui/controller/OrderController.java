package com.example.webgiatui.controller;

import com.example.webgiatui.dto.OrderDto;
import com.example.webgiatui.entity.Order;
import com.example.webgiatui.entity.Order.OrderStatus;
import com.example.webgiatui.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    private final OrderService orderService;
    
    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }
    
    /**
     * Get all orders
     */
    @GetMapping
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        List<OrderDto> orders = orderService.getAllOrderDtos();
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Get order by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long id) {
        try {
            Order order = orderService.getById(id);
            return ResponseEntity.ok(orderService.convertToDto(order));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Create a new order
     */
    @PostMapping
    public ResponseEntity<OrderDto> createOrder(@Valid @RequestBody OrderDto orderDto) {
        try {
            Order order = orderService.convertToEntity(orderDto);
            Order createdOrder = orderService.create(order);
            return new ResponseEntity<>(orderService.convertToDto(createdOrder), HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update an existing order
     */
    @PutMapping("/{id}")
    public ResponseEntity<OrderDto> updateOrder(@PathVariable Long id, @Valid @RequestBody OrderDto orderDto) {
        try {
            Order order = orderService.convertToEntity(orderDto);
            Order updatedOrder = orderService.update(id, order);
            return ResponseEntity.ok(orderService.convertToDto(updatedOrder));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete an order
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        try {
            orderService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get orders by customer ID
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderDto>> getOrdersByCustomerId(@PathVariable Long customerId) {
        List<Order> orders = orderService.findByCustomerId(customerId);
        List<OrderDto> orderDtos = orders.stream()
                .map(orderService::convertToDto)
                .toList();
        return ResponseEntity.ok(orderDtos);
    }
    
    /**
     * Get orders by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderDto>> getOrdersByStatus(@PathVariable String status) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            List<Order> orders = orderService.findByStatus(orderStatus);
            List<OrderDto> orderDtos = orders.stream()
                    .map(orderService::convertToDto)
                    .toList();
            return ResponseEntity.ok(orderDtos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update order status
     */
    @PatchMapping("/{id}/status/{status}")
    public ResponseEntity<OrderDto> updateOrderStatus(@PathVariable Long id, @PathVariable String status) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            Order updatedOrder = orderService.updateStatus(id, orderStatus);
            return ResponseEntity.ok(orderService.convertToDto(updatedOrder));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 