package com.example.webgiatui.controller;

public class OtherController {
    class OrderController {
        @Autowired
        private OrderService service;

        @GetMapping
        public List<Order> getOrders() {
            return service.getAllOrders();
        }

        @PostMapping
        public Order createOrder(@RequestBody Order order) {
            return service.createOrder(order);
        }

        @PutMapping("/{id}")
        public Order updateOrder(@PathVariable Long id, @RequestBody Order orderDetails) {
            return service.updateOrder(id, orderDetails);
        }
    }
}