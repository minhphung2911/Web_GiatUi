package com.example.webgiatui.service;

import com.example.webgiatui.entity.Customer;
import java.util.List;

public interface CustomerService {
    List<Customer> getAll();

    Customer create(Customer customer);

    Customer update(Long id, Customer customer);

    void delete(Long id);
}
