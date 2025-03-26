package com.example.webgiatui.service;

public class OtherController {
    @Autowired
private OrderRepository repository;

    public List<Order> getAllOrders() {
        return repository.findAll();
    }

    public Order createOrder(Order order) {
        return repository.save(order);
    }

    public Order updateOrder(Long id, Order orderDetails) {
        Order order = repository.findById(id).orElseThrow();
        order.setCustomerName(orderDetails.getCustomerName());
        order.setStatus(orderDetails.getStatus());
        return repository.save(order);
    }
}
