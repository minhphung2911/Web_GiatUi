package com.example.webgiatui.model;

import jakarta.persistence.*;

@Table(name = "Order")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String serviceType;
    private Double price;
    private String status;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    public Order() {}

    public Order(String serviceType, Double price, String status, User user) {
        this.serviceType = serviceType;
        this.price = price;
        this.status = status;
        this.user = user;
    }

    public Long getId() { return id; }
    public String getServiceType() { return serviceType; }
    public Double getPrice() { return price; }
    public String getStatus() { return status; }
    public User getUser() { return user; }

    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public void setPrice(Double price) { this.price = price; }
    public void setStatus(String status) { this.status = status; }
    public void setUser(User user) { this.user = user; }
}
