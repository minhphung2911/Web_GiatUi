package com.example.webgiatui.controller;

import com.example.webgiatui.entity.Order;
import com.example.webgiatui.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController extends BaseController<Order, OrderService> {

    @Autowired
    public OrderController(OrderService service) {
        super(service);
    }
}
