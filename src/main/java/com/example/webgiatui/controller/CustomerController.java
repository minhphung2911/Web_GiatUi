package com.example.webgiatui.controller;

import com.example.webgiatui.entity.Customer;
import com.example.webgiatui.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers")
public class CustomerController extends BaseController<Customer, CustomerService> {

    @Autowired
    public CustomerController(CustomerService service) {
        super(service);
    }
}
