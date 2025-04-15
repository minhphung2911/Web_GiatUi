package com.example.webgiatui.service.impl;

import com.example.webgiatui.dto.OrderDto;
import com.example.webgiatui.entity.Order;
import com.example.webgiatui.entity.Service;
import com.example.webgiatui.entity.User;
import com.example.webgiatui.entity.Order.OrderStatus;
import com.example.webgiatui.repository.OrderRepository;
import com.example.webgiatui.repository.ServiceRepository;
import com.example.webgiatui.repository.UserRepository;
import com.example.webgiatui.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@Transactional
public class OrderServiceImpl implements OrderService {
    
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    
    @Autowired
    public OrderServiceImpl(
            OrderRepository orderRepository,
            UserRepository userRepository,
            ServiceRepository serviceRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
    }

    @Override
    public List<Order> getAll() {
        return orderRepository.findAll();
    }

    @Override
    public Order create(Order order) {
        // Generate order code if not provided
        if (order.getOrderCode() == null || order.getOrderCode().isEmpty()) {
            order.setOrderCode(generateOrderCode());
        }
        
        // Set received date to today if not specified
        if (order.getReceivedDate() == null) {
            order.setReceivedDate(LocalDate.now());
        }
        
        // Set default status if not specified
        if (order.getStatus() == null) {
            order.setStatus(OrderStatus.PENDING);
        }
        
        return orderRepository.save(order);
    }

    @Override
    public Order getById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    @Override
    public Order update(Long id, Order orderDetails) {
        Order existingOrder = getById(id);
        
        // Update fields
        if (orderDetails.getCustomer() != null) {
            existingOrder.setCustomer(orderDetails.getCustomer());
        }
        
        if (orderDetails.getService() != null) {
            existingOrder.setService(orderDetails.getService());
        }
        
        if (orderDetails.getWeight() != null) {
            existingOrder.setWeight(orderDetails.getWeight());
        }
        
        if (orderDetails.getReceivedDate() != null) {
            existingOrder.setReceivedDate(orderDetails.getReceivedDate());
        }
        
        if (orderDetails.getReturnDate() != null) {
            existingOrder.setReturnDate(orderDetails.getReturnDate());
        }
        
        if (orderDetails.getStatus() != null) {
            existingOrder.setStatus(orderDetails.getStatus());
        }
        
        if (orderDetails.getNote() != null) {
            existingOrder.setNote(orderDetails.getNote());
        }
        
        return orderRepository.save(existingOrder);
    }

    @Override
    public void delete(Long id) {
        orderRepository.deleteById(id);
    }

    @Override
    public List<Order> findByCustomerId(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    @Override
    public List<Order> findByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    @Override
    public Order updateStatus(Long id, OrderStatus status) {
        Order order = getById(id);
        order.setStatus(status);
        
        // If status is COMPLETED and return date is not set, set it to today
        if (status == OrderStatus.COMPLETED && order.getReturnDate() == null) {
            order.setReturnDate(LocalDate.now());
        }
        
        return orderRepository.save(order);
    }

    @Override
    public OrderDto convertToDto(Order order) {
        if (order == null) {
            return null;
        }
        
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderCode(order.getOrderCode());
        
        // Set customer data
        if (order.getCustomer() != null) {
            dto.setCustomerId(order.getCustomer().getId());
            dto.setCustomerName(order.getCustomer().getName());
            dto.setCustomerEmail(order.getCustomer().getEmail());
            dto.setCustomerPhone(order.getCustomer().getPhoneNumber());
        }
        
        // Set service data
        if (order.getService() != null) {
            dto.setServiceId(order.getService().getId());
            dto.setServiceName(order.getService().getName());
        }
        
        dto.setWeight(order.getWeight());
        dto.setReceivedDate(order.getReceivedDate());
        dto.setReturnDate(order.getReturnDate());
        dto.setStatus(order.getStatus());
        dto.setNote(order.getNote());
        
        return dto;
    }

    @Override
    public Order convertToEntity(OrderDto dto) {
        if (dto == null) {
            return null;
        }
        
        Order order = new Order();
        
        // If ID is provided, it's an update operation
        if (dto.getId() != null) {
            order = getById(dto.getId());
        } else {
            // For new orders
            if (dto.getOrderCode() == null || dto.getOrderCode().isEmpty()) {
                order.setOrderCode(generateOrderCode());
            } else {
                order.setOrderCode(dto.getOrderCode());
            }
        }
        
        // Set customer
        if (dto.getCustomerId() != null) {
            User customer = userRepository.findById(dto.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found with id: " + dto.getCustomerId()));
            order.setCustomer(customer);
        }
        
        // Set service
        if (dto.getServiceId() != null) {
            Service service = serviceRepository.findById(dto.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Service not found with id: " + dto.getServiceId()));
            order.setService(service);
        }
        
        order.setWeight(dto.getWeight());
        order.setReceivedDate(dto.getReceivedDate());
        order.setReturnDate(dto.getReturnDate());
        order.setStatus(dto.getStatus());
        order.setNote(dto.getNote());
        
        return order;
    }

    @Override
    public List<OrderDto> getAllOrderDtos() {
        return orderRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public String generateOrderCode() {
        // Format: FLxxx-yymmdd
        // FL = Fresh Laundry, xxx = random number, yymmdd = date
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyMMdd");
        String dateStr = LocalDate.now().format(dateFormatter);
        
        Random random = new Random();
        int randomNumber = random.nextInt(1000);
        
        String orderCode = String.format("FL%03d-%s", randomNumber, dateStr);
        
        // Verify code is unique
        while (orderRepository.findByOrderCode(orderCode) != null) {
            randomNumber = random.nextInt(1000);
            orderCode = String.format("FL%03d-%s", randomNumber, dateStr);
        }
        
        return orderCode;
    }
}